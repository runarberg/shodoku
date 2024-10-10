import { State } from "ts-fsrs";

import { db } from "./index.ts";

const NEW_LIMIT = 10;
const REVIEW_LIMIT = 50;

const HOUR = 1000 * 60 * 60;

function midnight(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function getNewCards() {
  const now = new Date();
  const dayAgo = now.getTime() - 24 * HOUR;

  return db.transaction("r", [db.cards, db.reviews], async () => {
    const doneCount = await db.reviews
      .where(["log.state", "log.review"])
      .between([State.New, midnight()], [State.New, now], true, true)
      .count();

    const limit = Math.max(0, NEW_LIMIT - doneCount);

    return db.cards
      .orderBy("[priority+order]")
      .filter(
        ({ fsrs: { read, write } }) =>
          write.state === State.New ||
          (read.state === State.New &&
            write.state === State.Review &&
            (write.last_review ?? now).getTime() < dayAgo)
      )
      .limit(limit);
  });
}

export function getDueCards() {
  const epoc = new Date(0);
  const now = new Date();

  return db.transaction("r", [db.cards, db.reviews], async () => {
    const doneCount = await db.reviews
      .where(["log.state", "log.review"])
      .between([State.Review, midnight()], [State.Review, now], true, true)
      .count();

    const limit = Math.max(0, REVIEW_LIMIT - doneCount);

    return db.cards
      .where(["fsrs.write.state", "fsrs.write.due"])
      .between([State.Review, epoc], [State.Review, now], true, true)
      .or("[fsrs.read.state+fsrs.read.due]")
      .between([State.Review, epoc], [State.Review, now], true, true)
      .filter(({ decks }) => decks.length !== 0)
      .filter(
        ({ fsrs: { write, read } }) =>
          read.state === State.Review && write.state === State.Review
      )
      .limit(limit);
  });
}

export function getOngoingCards() {
  return db.cards
    .where("fsrs.read.state")
    .anyOf([State.Learning, State.Relearning])
    .or("fsrs.write.state")
    .anyOf([State.Learning, State.Relearning])
    .limit(REVIEW_LIMIT);
}

export function scheduledCardCount() {
  return db.transaction("r", [db.cards, db.reviews], async () => {
    const newCards = await getNewCards();
    const dueCards = await getDueCards();

    return {
      new: await newCards.count(),
      due: await dueCards.count(),
      ongoing: await getOngoingCards().count(),
    };
  });
}

export function scheduledCardIds() {
  return db.transaction("r", [db.cards, db.reviews], async () => {
    const newCards = await getNewCards();
    const ongoingCards = getOngoingCards();
    const dueCards = await getDueCards();

    const newIds = await newCards.primaryKeys();
    const ongoingIds = await ongoingCards.primaryKeys();
    const dueIds = await dueCards.primaryKeys();

    const ids = [...ongoingIds, ...dueIds];

    if (newIds.length > 0) {
      // Zip in the new cards at regular intervals
      const interval = Math.floor(ids.length / newIds.length);
      let offset = Math.floor(interval / 2);
      for (const newId of newIds) {
        ids.splice(offset, 0, newId);
        offset = Math.max(ids.length, offset + interval + 1);
      }
    }

    return ids;
  });
}
