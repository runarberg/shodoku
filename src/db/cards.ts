import { State } from "ts-fsrs";

import { EPOC, MAX_DATE, midnight } from "../helpers/time.ts";

import { db } from "./index.ts";

const NEW_LIMIT = 10;
const REVIEW_LIMIT = 50;

const LEARNING_STATES: Array<[State, State]> = [
  [State.Learning, State.New],
  [State.Learning, State.Learning],
  [State.Learning, State.Review],
  [State.Learning, State.Relearning],
  [State.Relearning, State.New],
  [State.Relearning, State.Learning],
  [State.Relearning, State.Review],
  [State.Relearning, State.Relearning],

  [State.New, State.Learning],
  [State.Review, State.Learning],
  [State.New, State.Relearning],
  [State.Review, State.Relearning],
];

const NEW_STATES: Array<[State, State]> = [
  [State.New, State.New],
  [State.New, State.Review],
  [State.Review, State.New],
];

const newStateOrderRanges: Array<
  [[State, State, number, number], [State, State, number, number]]
> = NEW_STATES.map(([read, write]) => [
  [read, write, 0, 0],
  [read, write, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
]);

function getLearningCards() {
  return db.cards
    .where(["fsrs.read.state", "fsrs.write.state"])
    .anyOf(LEARNING_STATES);
}

function getNewCards() {
  const now = new Date();

  return db.transaction("r", [db.cards, db.reviews], async () => {
    const doneCount = await db.reviews
      .where(["log.state", "log.review"])
      .between([State.New, midnight()], [State.New, now], true, true)
      .count();

    const limit = Math.max(0, NEW_LIMIT - doneCount);

    return db.cards
      .where(["fsrs.read.state", "fsrs.write.state", "priority", "order"])
      .inAnyRange(newStateOrderRanges)
      .limit(limit);
  });
}

async function newRemainingCount() {
  const statement = await getNewCards();
  return statement.count();
}

function getDueCards() {
  const epoc = new Date(0);
  const now = new Date();

  return db.transaction("r", [db.cards, db.reviews], async () => {
    const reviewed = new Set<number>();
    await db.reviews
      .where("log.review")
      .above(midnight())
      .each(({ cardId }) => reviewed.add(cardId));

    const doneCount = await db.reviews
      .where(["log.state", "log.review"])
      .between([State.Review, midnight()], [State.Review, now])
      .count();

    const limit = Math.max(0, REVIEW_LIMIT - doneCount);

    const readCards = db.cards
      .where(["fsrs.read.state", "fsrs.read.due"])
      .between([State.Review, epoc], [State.Review, now])
      .filter(
        ({ id, fsrs: { write } }) =>
          write.state !== State.Learning &&
          write.state !== State.Relearning &&
          !reviewed.has(id)
      )
      .limit(limit);

    const writeCards = db.cards
      .where(["fsrs.write.state", "fsrs.write.due"])
      .between([State.Review, epoc], [State.Review, now])
      .filter(
        ({ id, fsrs: { read } }) =>
          read.state !== State.Learning &&
          read.state !== State.Relearning &&
          !reviewed.has(id)
      )
      .limit(limit);

    return {
      limit,
      readCards,
      writeCards,
    };
  });
}

async function dueRemainingCount() {
  const { limit, readCards, writeCards } = await getDueCards();

  return Math.min(
    limit,
    (await readCards.count()) + (await writeCards.count())
  );
}

export async function nextReviewCard() {
  const now = new Date();

  return db.transaction("r", [db.reviews, db.cards], async () => {
    const writeLearning = await db.cards
      .where(["fsrs.write.state", "fsrs.write.due"])
      .inAnyRange([
        [
          [State.Learning, EPOC],
          [State.Learning, now],
        ],
        [
          [State.Relearning, EPOC],
          [State.Relearning, now],
        ],
      ])
      .reverse()
      .first();

    if (writeLearning) {
      return writeLearning;
    }

    const readLearning = await db.cards
      .where(["fsrs.read.state", "fsrs.read.due"])
      .inAnyRange([
        [
          [State.Learning, EPOC],
          [State.Learning, now],
        ],
        [
          [State.Relearning, EPOC],
          [State.Relearning, now],
        ],
      ])
      .reverse()
      .first();

    if (readLearning) {
      return readLearning;
    }

    const newDoneCount = await db.reviews
      .where(["log.state", "log.review"])
      .between([State.New, midnight()], [State.New, now])
      .count();

    const dueDoneCount = await db.reviews
      .where(["log.state", "log.review"])
      .between([State.Review, midnight()], [State.Review, now])
      .count();

    const newCount = await newRemainingCount();
    const dueCount = await dueRemainingCount();

    const totalNewCount = newCount + newDoneCount;
    const totalDueCount = dueCount + dueDoneCount;

    const newCardInterval = Math.ceil(
      (totalNewCount + totalDueCount) / totalNewCount
    );
    const newCardOffset = Math.floor(newCardInterval / 2);

    if (newCount === 0 && dueCount === 0) {
      return null;
    }

    if (dueCount === 0 || dueCount % newCardInterval === newCardOffset) {
      return (await getNewCards()).first();
    }

    const { readCards, writeCards } = await getDueCards();
    let firstRead = await readCards.first();
    let firstWrite = await writeCards.first();

    if (!firstRead && !firstWrite) {
      firstRead = await db.cards
        .where("fsrs.read.state")
        .anyOf([State.Learning, State.Relearning])
        .first();
      firstRead = await db.cards
        .where(["fsrs.read.state", "fsrs.read.due"])
        .inAnyRange([
          [
            [State.Learning, EPOC],
            [State.Learning, MAX_DATE],
          ],
          [
            [State.Relearning, EPOC],
            [State.Relearning, MAX_DATE],
          ],
        ])
        .first();

      firstWrite = await db.cards
        .where(["fsrs.write.state", "fsrs.write.due"])
        .inAnyRange([
          [
            [State.Learning, EPOC],
            [State.Learning, MAX_DATE],
          ],
          [
            [State.Relearning, EPOC],
            [State.Relearning, MAX_DATE],
          ],
        ])
        .first();
    }

    if (!firstWrite) {
      return firstRead;
    }

    if (!firstRead) {
      return firstWrite;
    }

    if (firstRead.fsrs.read.due < firstWrite.fsrs.write.due) {
      return firstRead;
    } else {
      return firstWrite;
    }
  });
}

export function remainingCount() {
  return db.transaction("r", [db.reviews, db.cards], async () => ({
    new: await newRemainingCount(),
    due: await dueRemainingCount(),
    learning: await getLearningCards().count(),
  }));
}
