import { RecordLogItem, State } from "ts-fsrs";

import { count, first, take } from "../helpers/iterators.ts";
import { EPOC, midnight } from "../helpers/time.ts";
import { CardProgress, CardType } from "../types.ts";

import { db } from "./index.ts";

const NEW_LIMIT = 10;
const REVIEW_LIMIT = 50;

async function* getLearningCards(dueBefore?: Date) {
  const cardIds = new Set<number>();

  let cursor = await (await db)
    .transaction("progress")
    .store.index("state+due")
    .openCursor();

  while (cursor) {
    const [state, due] = cursor.key;

    if (state < State.Learning) {
      cursor = await cursor.continue([State.Learning, EPOC]);
      continue;
    }

    if (state > State.Learning && state < State.Relearning) {
      cursor = await cursor.continue([State.Relearning, EPOC]);
      continue;
    }

    if (!dueBefore || due < dueBefore) {
      const [cardId] = cursor.primaryKey;

      if (!cardIds.has(cardId)) {
        yield cursor;
        cardIds.add(cardId);
      }
    }

    cursor = await cursor.continue();
  }
}

async function getReviewedToday(): Promise<Set<number>> {
  const reviewed = new Set<number>();
  const index = (await db)
    .transaction("reviews")
    .store.index("review")
    .iterate(IDBKeyRange.lowerBound(midnight()));

  for await (const cursor of index) {
    reviewed.add(cursor.value.cardId);
  }

  return reviewed;
}

async function getNewDoneCount() {
  const now = new Date();

  return (await db)
    .transaction("reviews")
    .store.index("state+review")
    .count(
      IDBKeyRange.bound([State.New, midnight()], [State.New, now], true, true)
    );
}

async function* getNewCards() {
  const reviewed = await getReviewedToday();

  const tx = (await db).transaction(["cards", "progress"], "readwrite");
  const cardsStore = tx.objectStore("cards");
  const progressStateIndex = tx
    .objectStore("progress")
    .index("cardId+cardType+state");

  let cardsCursor = await cardsStore
    .index("position")
    .openKeyCursor(
      IDBKeyRange.bound(
        [0, 0],
        [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
        false,
        true
      )
    );

  while (cardsCursor) {
    if (reviewed.has(cardsCursor.primaryKey)) {
      cardsCursor = await cardsCursor.continue();
      continue;
    }

    let progressCursor = await progressStateIndex.openCursor([
      cardsCursor.primaryKey,
      "kanji-write",
      State.New,
    ]);

    if (!progressCursor) {
      progressCursor = await progressStateIndex.openCursor([
        cardsCursor.primaryKey,
        "kanji-read",
        State.New,
      ]);
    }

    if (progressCursor) {
      yield progressCursor;
    }

    cardsCursor = await cardsCursor.continue();
  }
}

async function getDueDoneCount() {
  const now = new Date();

  return (await db)
    .transaction("reviews")
    .store.index("state+review")
    .count(
      IDBKeyRange.bound(
        [State.Review, midnight()],
        [State.Review, now],
        false,
        true
      )
    );
}

async function* getDueCards() {
  const now = new Date();
  const reviewed = await getReviewedToday();

  const tx = (await db).transaction(
    ["cards", "progress", "reviews"],
    "readonly"
  );
  const cardsStore = tx.objectStore("cards");
  const progressStore = tx.objectStore("progress");

  const reviewRange = IDBKeyRange.bound(
    [State.Review, EPOC],
    [State.Review, now],
    false,
    true
  );

  let cursor = await progressStore.index("state+due").openCursor(reviewRange);

  while (cursor) {
    const [cardId] = cursor.primaryKey;

    if (!reviewed.has(cardId)) {
      const card = await cardsStore.get(cardId);
      if (card && card.position.priority < Number.POSITIVE_INFINITY) {
        yield cursor;
      }
    }

    cursor = await cursor.continue();
  }
}

async function newRemainingCount(): Promise<number> {
  const doneCount = await getNewDoneCount();
  const limit = Math.max(0, NEW_LIMIT - doneCount);

  return count(take(limit, getNewCards()));
}

async function dueRemainingCount(): Promise<number> {
  const doneCount = await getDueDoneCount();
  const limit = Math.max(0, REVIEW_LIMIT - doneCount);

  return count(take(limit, getDueCards()));
}

export async function nextReviewCard(): Promise<CardProgress | null> {
  const nextDueLearningCard = await first(getLearningCards(new Date()));
  if (nextDueLearningCard) {
    return nextDueLearningCard.value;
  }

  const newCount = await newRemainingCount();
  const newDoneCount = await getNewDoneCount();

  const dueCount = await dueRemainingCount();
  const dueDoneCount = await getDueDoneCount();

  const totalNewCount = newCount + newDoneCount;
  const totalDueCount = dueCount + dueDoneCount;

  const newCardInterval = Math.ceil(
    (totalNewCount + totalDueCount) / totalNewCount
  );

  const newCardOffset = Math.floor(newCardInterval / 2);

  if (
    newCount > 0 &&
    (dueCount === 0 || dueCount % newCardInterval === newCardOffset)
  ) {
    const nextNewCard = await first(getNewCards());
    if (nextNewCard) {
      return nextNewCard.value;
    }
  }

  const nextDueCard = await first(getDueCards());
  if (nextDueCard) {
    return nextDueCard.value;
  }

  const nextLearningCard = await first(getLearningCards());
  if (nextLearningCard) {
    return nextLearningCard.value;
  }

  return null;
}

export async function remainingCount() {
  return {
    new: await newRemainingCount(),
    due: await dueRemainingCount(),
    learning: await count(getLearningCards()),
  };
}

export async function rateCard(
  cardId: number,
  cardType: CardType,
  next: RecordLogItem
) {
  const tx = (await db).transaction(["progress", "reviews"], "readwrite");
  const progress = tx.objectStore("progress");
  const reviews = tx.objectStore("reviews");

  await progress.put({ cardId, cardType, fsrs: next.card });
  await reviews.add({ cardId, cardType, log: next.log });
}
