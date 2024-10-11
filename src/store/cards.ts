import {
  computed,
  ComputedRef,
  MaybeRefOrGetter,
  toValue,
  watchEffect,
} from "vue";

import { nextReviewCard, remainingCount } from "../db/cards.ts";
import { db } from "../db/index.ts";
import { useLiveQuery } from "../helpers/db.ts";
import { Card } from "../types.ts";

export function useReviewCard(
  id: MaybeRefOrGetter<number | null | undefined>
): ComputedRef<Card | null | undefined> {
  const query = computed(() => {
    const idValue = toValue(id);

    if (idValue) {
      return () => db.cards.get(idValue);
    }

    return nextReviewCard;
  });

  const { value, error } = useLiveQuery(query);

  watchEffect(() => {
    if (error.value) {
      console.error(error.value);
    }
  });

  return value;
}

type Count = { new: number; due: number; learning: number };

export function useRemainingCount(): ComputedRef<Count | null | undefined> {
  const { value, error } = useLiveQuery(remainingCount);

  watchEffect(() => {
    if (error.value) {
      console.error(error.value);
    }
  });

  return value;
}
