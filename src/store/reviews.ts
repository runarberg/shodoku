import { pipe } from "@runarberg/yta";
import { filter, map, take, toArray, uniqueOn } from "@runarberg/yta/async";
import { useLocalStorage } from "@vueuse/core";
import { defineStore } from "pinia";
import { RecordLogItem, State } from "ts-fsrs";
import { computed, ref, watch } from "vue";

import { db } from "../db/index.ts";
import {
  getDueCards,
  getDueDoneCount,
  getExtraLimits,
  getLearningCards,
  getNewCards,
  getNewDoneCount,
  rateCard as rateCardDb,
} from "../db/cards.ts";
import { useLiveQuery } from "../helpers/db.ts";
import { liveQueryBroadcaster } from "../helpers/channels.ts";
import { HOUR, midnight } from "../helpers/time.ts";
import { CardProgress, CardReview } from "../types.ts";

export const dueLimit = useLocalStorage(
  "shodoku.app.preferences.limit.due",
  50
);

export const newLimit = useLocalStorage(
  "shodoku.app.preferences.limit.new",
  10
);

export const fsrsFuzzEnabled = useLocalStorage(
  "shodoku.app.preferences.fsrs.fuzz-enabled",
  true
);

export async function increaseReviewLimit(
  count = { new: newLimit.value, due: dueLimit.value }
) {
  await (
    await db
  ).add("review-limits", {
    time: new Date(),
    count,
  });

  return liveQueryBroadcaster.postMessage("review-limit-increased");
}

const useReviewsStore = defineStore("reviews", () => {
  const refreshing = ref(false);
  const learningQueue = ref<CardProgress[]>([]);
  const dueQueue = ref<CardProgress[]>([]);
  const newQueue = ref<CardProgress[]>([]);

  const dueDoneCount = ref(0);
  const newDoneCount = ref(0);

  const queue = computed<CardProgress[]>(() => {
    const now = new Date();
    let learningIndex = 0;
    let dueIndex = 0;
    let newIndex = 0;
    let nextLearningCard = learningQueue.value.at(learningIndex);

    const result: CardProgress[] = [];

    while (nextLearningCard && nextLearningCard.fsrs.due < now) {
      result.push(nextLearningCard);
      learningIndex += 1;
      nextLearningCard = learningQueue.value.at(learningIndex);
    }

    const dueCount = dueQueue.value.length;
    const newCount = newQueue.value.length;
    const totalDueCount = dueCount + dueDoneCount.value;
    const totalNewCount = newCount + newDoneCount.value;

    const newCardInterval = Math.ceil(
      (totalNewCount + totalDueCount) / totalNewCount
    );

    const newCardOffset = Math.floor(newCardInterval / 2);

    let nextDue = dueQueue.value.at(dueIndex);
    let nextNew = newQueue.value.at(newIndex);
    while (nextDue || nextNew) {
      if (!nextNew) {
        if (nextDue) {
          result.push(nextDue);
        }
        dueIndex += 1;
        nextDue = dueQueue.value.at(dueIndex);
        continue;
      }

      if (!nextDue) {
        if (nextNew) {
          result.push(nextNew);
        }
        newIndex += 1;
        nextNew = newQueue.value.at(newIndex);
        continue;
      }

      const progressIndex =
        dueDoneCount.value + dueIndex + newDoneCount.value + newIndex;
      if (progressIndex % newCardInterval === newCardOffset) {
        result.push(nextNew);
        newIndex += 1;
        nextNew = newQueue.value.at(newIndex);
      } else {
        result.push(nextDue);
        dueIndex += 1;
        nextDue = dueQueue.value.at(dueIndex);
      }
    }

    while (nextLearningCard) {
      result.push(nextLearningCard);
      learningIndex += 1;
      nextLearningCard = learningQueue.value.at(learningIndex);
    }

    return result;
  });

  async function rateCard(
    { cardId, cardType, fsrs }: CardProgress,
    next: RecordLogItem
  ) {
    if (fsrs.state === State.New) {
      newQueue.value = newQueue.value.filter(
        (other) => other.cardId !== cardId
      );
      newDoneCount.value += 1;
    } else if (fsrs.state === State.Review) {
      dueQueue.value = dueQueue.value.filter(
        (other) => other.cardId !== cardId
      );
      dueDoneCount.value += 1;
    } else {
      learningQueue.value = learningQueue.value.filter(
        (other) => other.cardId !== cardId
      );
    }

    if (
      next.card.state === State.Learning ||
      next.card.state === State.Relearning
    ) {
      const card: CardProgress = {
        cardId,
        cardType,
        fsrs: next.card,
      };
      const due = next.card.due;
      const index = learningQueue.value.findIndex(
        (other) => due < other.fsrs.due
      );

      learningQueue.value = learningQueue.value.toSpliced(
        index === -1 ? learningQueue.value.length : index,
        0,
        card
      );
    }

    await rateCardDb({ cardId, cardType }, next);

    liveQueryBroadcaster.postMessage("card-review");
  }

  function learningQueueIncludes(cardId: number): boolean {
    return learningQueue.value.some((other) => other.cardId === cardId);
  }

  function dueQueueIncludes(cardId: number): boolean {
    return dueQueue.value.some((other) => other.cardId === cardId);
  }

  async function refreshQueues() {
    refreshing.value = true;

    try {
      const extraLimits = await getExtraLimits();

      dueDoneCount.value = await getDueDoneCount();
      newDoneCount.value = await getNewDoneCount();

      learningQueue.value = await pipe(
        getLearningCards(),
        map((cursor) => cursor.value),
        toArray()
      );

      dueQueue.value = await pipe(
        getDueCards(),
        uniqueOn(({ primaryKey: [cardId] }) => cardId),
        filter(({ primaryKey: [cardId] }) => !learningQueueIncludes(cardId)),
        take(
          Math.max(0, dueLimit.value + extraLimits.due - dueDoneCount.value)
        ),
        map((cursor) => cursor.value),
        toArray()
      );

      newQueue.value = await pipe(
        getNewCards(),
        uniqueOn((cursor) => cursor.primaryKey[0]),
        filter(
          ({ primaryKey: [cardId] }) =>
            !learningQueueIncludes(cardId) && !dueQueueIncludes(cardId)
        ),
        take(
          Math.max(0, newLimit.value + extraLimits.new - newDoneCount.value)
        ),
        map((cursor) => cursor.value),
        toArray()
      );
    } finally {
      refreshing.value = false;
    }
  }

  refreshQueues();
  setTimeout(refreshQueues, HOUR);
  watch([dueLimit, newLimit], refreshQueues);

  return {
    refreshing,
    learningQueue,
    dueQueue,
    newQueue,
    queue,
    refreshQueues,
    rateCard,
  };
});

export function useRemainingCount() {
  const store = useReviewsStore();

  return computed(() => ({
    due: store.dueQueue.length,
    new: store.newQueue.length,
    learning: store.learningQueue.length,
  }));
}

export function useReviewedCards() {
  const { result } = useLiveQuery(async () => {
    const cards = new Map<number, CardReview[]>();
    const reviewIndex = (await db).transaction("reviews").store.index("review");

    for await (const cursor of reviewIndex.iterate(
      IDBKeyRange.lowerBound(midnight())
    )) {
      const review = cursor.value as CardReview;

      let reviews = cards.get(review.cardId);
      if (!reviews) {
        reviews = [];
        cards.set(review.cardId, reviews);
      }

      reviews.push(review);
    }

    return cards;
  });

  return result;
}

export default useReviewsStore;
