import { computed, ComputedRef, MaybeRefOrGetter, toValue } from "vue";

import { getDeckStatus } from "../db/decks.ts";
import { db } from "../db/index.ts";
import { useLiveQuery } from "../helpers/db.ts";
import { useFsrs } from "../helpers/fsrs.ts";
import { Deck } from "../types.ts";

export function useDeck(
  name: MaybeRefOrGetter<string>,
): ComputedRef<Deck | undefined | null> {
  const query = computed(() => {
    const nameValue = toValue(name);
    return async () => (await db).get("decks", nameValue);
  });

  const { result } = useLiveQuery(query);

  return result;
}

export function useDecks(): ComputedRef<Deck[] | null> {
  return useLiveQuery(async () => {
    const decks = await (await db)
      .transaction("decks")
      .store.index("category+priority")
      .getAll();

    return decks.filter(({ active }) => active);
  }).result;
}

export function useDeckStatus(name: MaybeRefOrGetter<string>) {
  const fsrs = useFsrs();

  const query = computed(() => {
    const nameValue = toValue(name);
    return () => getDeckStatus(nameValue, fsrs.value);
  });

  const { result } = useLiveQuery(query);

  return result;
}
