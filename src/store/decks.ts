import { computed, ComputedRef, MaybeRefOrGetter, toValue } from "vue";

import { db } from "../db/index.ts";
import { useLiveQuery } from "../helpers/db.ts";
import { Deck } from "../types";

export function useDeck(
  name: MaybeRefOrGetter<string>
): ComputedRef<Deck | undefined | null> {
  const query = computed(() => {
    const nameValue = toValue(name);
    return async () => (nameValue ? (await db).get("decks", nameValue) : null);
  });

  const { result: value } = useLiveQuery(query);

  return value;
}

export function useDecks(): ComputedRef<Deck[] | null> {
  return useLiveQuery(async () =>
    (await db).transaction("decks").store.index("category+priority").getAll()
  ).result;
}
