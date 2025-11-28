import { computed, ComputedRef, MaybeRefOrGetter, toValue } from "vue";

import { getDeckStatus } from "../db/decks.ts";
import { db as openingDb } from "../db/index.ts";
import { useLiveQuery } from "../helpers/db.ts";
import { useFsrs } from "../helpers/fsrs.ts";
import { Deck } from "../types.ts";

export function useDeck(
  name: MaybeRefOrGetter<string>,
): ComputedRef<Deck | undefined | null> {
  const query = computed(() => {
    const nameValue = toValue(name);

    return async () => {
      const db = await openingDb;
      return db.get("decks", nameValue);
    };
  });

  const { result } = useLiveQuery(query);

  return result;
}

export function useDecks(): ComputedRef<Deck[] | null> {
  const { result } = useLiveQuery(async () => {
    const db = await openingDb;
    const decks = await db
      .transaction("decks")
      .store.index("priority")
      .getAll();

    return decks.filter(({ active }) => active);
  });

  return result;
}

export function useDecksContainingCard(
  cardIdRef: MaybeRefOrGetter<number | undefined>,
): ComputedRef<Deck[]> {
  const query = computed(() => {
    const cardId = toValue(cardIdRef);

    return async () => {
      if (!cardId) {
        return [];
      }

      const db = await openingDb;
      const decks = await db
        .transaction("decks")
        .store.index("cards")
        .getAll(IDBKeyRange.only(cardId));

      return decks.filter(({ active }) => active);
    };
  });

  const { result } = useLiveQuery(query, []);
  return result;
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
