import {
  computed,
  ComputedRef,
  MaybeRefOrGetter,
  toValue,
  watchEffect,
} from "vue";

import { nextReviewCard, remainingCount } from "../db/cards.ts";
import { db } from "../db/index.ts";
import { LiveQueryResult, useLiveQuery } from "../helpers/db.ts";
import { CardProgress, CardType } from "../types.ts";

export function useCardProgress(
  progress: MaybeRefOrGetter<
    { cardId: number; cardType: CardType } | null | undefined
  >
): LiveQueryResult<CardProgress | null | undefined> {
  const query = computed(() => {
    const value = toValue(progress);

    if (value) {
      const { cardId, cardType } = value;
      return async () => (await db).get("progress", [cardId, cardType]);
    }

    return nextReviewCard;
  });

  return useLiveQuery(query);
}

type Count = { new: number; due: number; learning: number };

export function useRemainingCount(): ComputedRef<Count | null | undefined> {
  const { result: value, error } = useLiveQuery(remainingCount);

  watchEffect(() => {
    if (error.value) {
      console.error(error.value);
    }
  });

  return value;
}
