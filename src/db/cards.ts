import { RecordLogItem, State } from "ts-fsrs";

import { count, first, take } from "../helpers/iterators.ts";
import { EPOC, HOUR, midnight } from "../helpers/time.ts";
import { CardProgress } from "../types.ts";

import { db } from "./index.ts";
import { dueLimit, newLimit } from "../store/reviews";
import { liveQueryChannel } from "../helpers/channels";

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

let newDoneCountCache: number | null = null;
async function getNewDoneCount() {
  const now = new Date();
  const counting = (await db)
    .transaction("reviews")
    .store.index("state+review")
    .count(
      IDBKeyRange.bound([State.New, midnight()], [State.New, now], true, true)
    );

  counting.then((result) => {
    newDoneCountCache = result;
  });

  return counting;
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

let dueDoneCountCache: number | null = null;
async function getDueDoneCount() {
  const now = new Date();
  const counting = (await db)
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

  counting.then((result) => {
    dueDoneCountCache = result;
  });

  return counting;
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

type ExtraLimit = { due: number; new: number };
async function getExtraLimits(): Promise<ExtraLimit> {
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

let newRemainingCountCache: number | null = null;
async function newRemainingCount(extraLimit = 0): Promise<number> {
  const doneCount = await getNewDoneCount();
  const limit = Math.max(0, newLimit.value + extraLimit - doneCount);
  const counting = count(take(limit, getNewCards()));

  counting.then((result) => {
    newRemainingCountCache = result;
  });

  return counting;
}

let dueRemainingCountCache: number | null = null;
async function dueRemainingCount(extraLimit = 0): Promise<number> {
  const doneCount = await getDueDoneCount();
  const limit = Math.max(0, dueLimit.value + extraLimit - doneCount);
  const counting = count(take(limit, getDueCards()));

  counting.then((result) => {
    dueRemainingCountCache = result;
  });

  return counting;
}

export async function nextReviewCard(): Promise<CardProgress | null> {
  const nextDueLearningCard = await first(getLearningCards(new Date()));
  if (nextDueLearningCard) {
    return nextDueLearningCard.value;
  }

  const extraLimits = await getExtraLimits();

  const newCount =
    newRemainingCountCache ?? (await newRemainingCount(extraLimits.new));
  const newDoneCount = newDoneCountCache ?? (await getNewDoneCount());

  const dueCount =
    dueRemainingCountCache ?? (await dueRemainingCount(extraLimits.due));
  const dueDoneCount = dueDoneCountCache ?? (await getDueDoneCount());

  const totalNewCount = newCount + newDoneCount;
  const totalDueCount = dueCount + dueDoneCount;
  const remainingCount = newCount + dueCount;

  const newCardInterval = Math.ceil(
    (totalNewCount + totalDueCount) / totalNewCount
  );

  const newCardOffset = Math.floor(newCardInterval / 2);

  if (
    newCount > 0 &&
    (dueCount === 0 || remainingCount % newCardInterval === newCardOffset)
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
  const extraLimits = await getExtraLimits();

  return {
    new: await newRemainingCount(extraLimits.new),
    due: await dueRemainingCount(extraLimits.due),
    learning: await count(getLearningCards()),
  };
}

export async function rateCard(
  { cardId, cardType, fsrs }: CardProgress,
  next: RecordLogItem
) {
  const tx = (await db).transaction(["progress", "reviews"], "readwrite");
  const progress = tx.objectStore("progress");
  const reviews = tx.objectStore("reviews");

  if (fsrs.state === State.New) {
    if (newRemainingCountCache !== null) {
      newRemainingCountCache -= 1;
    }
    if (newDoneCountCache !== null) {
      newDoneCountCache += 1;
    }
  } else if (fsrs.state === State.Review) {
    if (dueRemainingCountCache !== null) {
      dueRemainingCountCache -= 1;
    }
    if (dueDoneCountCache !== null) {
      dueDoneCountCache += 1;
    }
  }

  await progress.put({ cardId, cardType, fsrs: next.card });
  await reviews.add({ cardId, cardType, log: next.log });
}

function clearCache() {
  dueDoneCountCache = null;
  dueRemainingCountCache = null;
  newDoneCountCache = null;
  newRemainingCountCache = null;
}

globalThis.setInterval(clearCache, HOUR);
liveQueryChannel.addEventListener("message", (event: MessageEvent<string>) => {
  if (event.data === "review-limit-increased") {
    clearCache();
  }
});
