import {
  computed,
  ComputedRef,
  inject,
  InjectionKey,
  MaybeRefOrGetter,
  onScopeDispose,
  provide,
  ShallowReactive,
  shallowReactive,
  toValue,
  watch,
} from "vue";

import { DeckStatusCount, getDeckStatus } from "../db/decks.ts";
import { db as openingDb } from "../db/index.ts";
import { LiveQueryResult, useLiveQuery } from "../helpers/db.ts";
import { useDeckTemplate } from "../helpers/decks.ts";
import { useFsrs } from "../helpers/fsrs.ts";
import { CardType, type Deck } from "../types.ts";

function useDeckLiveQuery(
  name: MaybeRefOrGetter<string | null>,
): LiveQueryResult<Deck | undefined | null> {
  const query = computed(() => {
    const nameValue = toValue(name);

    if (!nameValue) {
      return () => null;
    }

    return async () => {
      const db = await openingDb;
      return db.get("decks", nameValue);
    };
  });

  return useLiveQuery(query);
}

export function useDeck(
  name: MaybeRefOrGetter<string | null>,
): ComputedRef<Deck | undefined | null> {
  const { result } = useDeckLiveQuery(name);

  return result;
}

export function useDeckOrTemplate(name: MaybeRefOrGetter<string | null>): {
  deck: ComputedRef<Pick<Deck, "name" | "cards" | "cardTypes"> | null>;
  loading: ComputedRef<boolean>;
} {
  const dbDeck = useDeckLiveQuery(name);
  const useTemplateBackup = computed(
    () => !dbDeck.loading.value && dbDeck.result.value === undefined,
  );

  const deckTemplate = useDeckTemplate(() =>
    useTemplateBackup.value ? toValue(name) : null,
  );

  const deck = computed(() => {
    if (useTemplateBackup.value) {
      return deckTemplate.deck.value;
    }

    return dbDeck.result.value ?? null;
  });

  const loading = computed<boolean>(() => {
    if (useTemplateBackup.value) {
      return deckTemplate.loading.value;
    }

    return dbDeck.loading.value;
  });

  return {
    deck,
    loading,
  };
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

type DeckStatus = Map<CardType, DeckStatusCount>;
const DECK_STATUSES_INJECTION_KEY: InjectionKey<
  ShallowReactive<Map<string, DeckStatus>>
> = Symbol("deck-status");

export function provideDeckStatuses() {
  const deckStatuses = shallowReactive(new Map<string, DeckStatus>());

  provide(DECK_STATUSES_INJECTION_KEY, deckStatuses);

  return deckStatuses;
}

export function useDeckStatus(name: MaybeRefOrGetter<string>) {
  const fsrs = useFsrs();
  const deckStatuses = inject(
    DECK_STATUSES_INJECTION_KEY,
    new Map<string, DeckStatus>(),
  );

  const query = computed(() => {
    const nameValue = toValue(name);
    return () => getDeckStatus(nameValue, fsrs.value);
  });

  const { result } = useLiveQuery(query);

  watch(result, (resultValue) => {
    if (resultValue) {
      deckStatuses.set(toValue(name), resultValue);
    } else {
      deckStatuses.delete(toValue(name));
    }
  });

  onScopeDispose(() => {
    deckStatuses.delete(toValue(name));
  });

  return result;
}
