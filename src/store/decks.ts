import { computed, ComputedRef, MaybeRefOrGetter, toValue } from "vue";

import { db } from "../db/index.ts";
import { useLiveQuery } from "../helpers/db.ts";
import { Deck } from "../types";

export function useDeck(
  name: MaybeRefOrGetter<string>
): ComputedRef<Deck | undefined | null> {
  const query = computed(() => {
    const nameValue = toValue(name);

    return () => db.decks.where("name").equals(nameValue).first();
  });

  const { value } = useLiveQuery(query);

  return value;
}

export function useDecks(): ComputedRef<Deck[] | null> {
  return useLiveQuery(() =>
    db.decks
      .where("[category+priority]")
      .between(
        ["\u{0000}", Number.NEGATIVE_INFINITY],
        ["\u{10FFFF}", Number.POSITIVE_INFINITY]
      )
      .toArray()
  ).value;
}
