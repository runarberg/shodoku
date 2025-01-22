import { RecordLogItem, State } from "ts-fsrs";

import { EPOC, midnight } from "../helpers/time.ts";
import { CardProgress } from "../types.ts";

import { db } from "./index.ts";

export async function* getLearningCards(dueBefore?: Date) {
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

export async function getNewDoneCount() {
  const now = new Date();
  return (await db)
    .transaction("reviews")
    .store.index("state+review")
    .count(
      IDBKeyRange.bound([State.New, midnight()], [State.New, now], true, true)
    );
}

export async function* getNewCards() {
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

export async function getDueDoneCount() {
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

export async function* getDueCards() {
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

type ExtraLimit = { due: number; new: number };
export async function getExtraLimits(): Promise<ExtraLimit> {
  const extraLimits = await (
    await db
  ).getAllFromIndex(
    "review-limits",
    "time",
    IDBKeyRange.lowerBound(midnight())
  );

  const sum = { due: 0, new: 0 };
  for (const { count } of extraLimits) {
    sum.due += count.due;
    sum.new += count.new;
  }

  return sum;
}

export async function rateCard(
  { cardId, cardType }: Omit<CardProgress, "fsrs">,
  next: RecordLogItem
) {
  const tx = (await db).transaction(["progress", "reviews"], "readwrite");
  const progress = tx.objectStore("progress");
  const reviews = tx.objectStore("reviews");

  await progress.put({ cardId, cardType, fsrs: next.card });
  await reviews.add({ cardId, cardType, log: next.log });
}
