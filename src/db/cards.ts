import { RecordLogItem, State } from "ts-fsrs";

import { EPOC, midnight } from "../helpers/time.ts";
import { CardProgress, CardType } from "../types.ts";
import { db } from "./index.ts";
import { addToSyncStaging } from "./sync.ts";

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
      IDBKeyRange.bound([State.New, midnight()], [State.New, now], true, true),
    );
}

export async function* getNewCards() {
  const reviewed = await getReviewedToday();

  const tx = (await db).transaction(["decks", "progress"]);
  const progressStore = tx.objectStore("progress");

  const yielded = new Set<number>();
  for await (const { value: deck } of tx
    .objectStore("decks")
    .index("priority")) {
    if (!deck.active) {
      continue;
    }

    for (const cardId of deck.cards) {
      if (yielded.has(cardId) || reviewed.has(cardId)) {
        continue;
      }

      for (const cardType of ["kanji-write", "kanji-read"] as CardType[]) {
        const progress = await progressStore.get([cardId, cardType]);
        if (progress?.fsrs.state === State.New) {
          yield progress;
          break;
        }
      }
    }
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
        true,
      ),
    );
}

export async function* getDueCards() {
  const now = new Date();
  const reviewed = await getReviewedToday();

  const tx = (await db).transaction(
    ["decks", "progress", "reviews"],
    "readonly",
  );
  const decksStore = tx.objectStore("decks");
  const decksStoreCardsIndex = decksStore.index("cards");
  const progressStore = tx.objectStore("progress");

  const reviewRange = IDBKeyRange.bound(
    [State.Review, EPOC],
    [State.Review, now],
    false,
    true,
  );

  const yielded = new Set<number>();
  let cursor = await progressStore.index("state+due").openCursor(reviewRange);

  while (cursor) {
    const [cardId] = cursor.primaryKey;

    if (!yielded.has(cardId) && !reviewed.has(cardId)) {
      // See if this card belongs to at least one deck.
      const deckId = await decksStoreCardsIndex.getKey(
        IDBKeyRange.only(cardId),
      );

      if (deckId) {
        // Orphaned cards are suspended from review.
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
    IDBKeyRange.lowerBound(midnight()),
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
  next: RecordLogItem,
) {
  const tx = (await db).transaction(["progress", "reviews"], "readwrite");
  const progress = tx.objectStore("progress");
  const reviews = tx.objectStore("reviews");

  await progress.put({ cardId, cardType, fsrs: next.card });
  const reviewId = await reviews.add({ cardId, cardType, log: next.log });

  addToSyncStaging([
    {
      store: "progress",
      op: "put",
      key: [cardId, cardType],
    },

    {
      store: "reviews",
      op: "add",
      key: reviewId,
    },
  ]);

  await tx.done;
}
