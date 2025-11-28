import { FSRS, fsrs as createFsrs, generatorParameters, State } from "ts-fsrs";
import {
  computed,
  ComputedRef,
  MaybeRefOrGetter,
  ShallowReactive,
  shallowReactive,
  toValue,
  watch,
} from "vue";

import { db } from "../db/index.ts";
import {
  fsrsFuzzEnabled,
  knownMinDueWeeks,
  knownMinRetention,
} from "../store/reviews.ts";
import { CardProgress, CardType } from "../types.ts";
import { useLiveQuery } from "./db.ts";
import { isKanji } from "./text.ts";
import { WEEK } from "./time.ts";

export function useFsrs() {
  return computed(() => {
    const params = generatorParameters({
      enable_fuzz: fsrsFuzzEnabled.value,
    });

    return createFsrs(params);
  });
}

export function useCardProgress(
  cardId: MaybeRefOrGetter<number | undefined>,
  cardTypes: CardType[],
): ComputedRef<Map<CardType, CardProgress>> {
  const { result } = useLiveQuery(
    computed(() => {
      const id = toValue(cardId);

      return async () => {
        const progressMap = new Map<CardType, CardProgress>();

        if (!id) {
          return progressMap;
        }

        const progressStore = (await db).transaction("progress").store;

        for (const cardType of cardTypes) {
          const progress = await progressStore.get([id, cardType]);
          if (progress) {
            progressMap.set(cardType, progress);
          }
        }

        return progressMap;
      };
    }),

    new Map<CardType, CardProgress>(),
  );

  return result;
}

export type CardRetrievability = number | "learning" | "relearning" | null;

function getRetrievability(
  progress: CardProgress | null,
  fsrs: FSRS,
  now = new Date(),
): CardRetrievability {
  if (!progress) {
    return null;
  }

  if (progress.fsrs.state === State.Learning) {
    return "learning";
  }

  if (progress.fsrs.state === State.Relearning) {
    return "relearning";
  }

  return fsrs.get_retrievability(progress.fsrs, now, false);
}

export function useCardRetrievability(
  codepoint: MaybeRefOrGetter<number | undefined>,
  cardTypes: CardType[],
): ComputedRef<Map<CardType, CardRetrievability>> {
  const fsrs = useFsrs();
  const progresses = useCardProgress(codepoint, cardTypes);

  return computed(() => {
    const now = new Date();
    const fsrsValue = fsrs.value;
    const result = new Map<CardType, CardRetrievability>();

    for (const [cardType, cardProgress] of progresses.value) {
      result.set(cardType, getRetrievability(cardProgress, fsrsValue, now));
    }

    return result;
  });
}

export function useHighKanjiReadingProficiency(
  writing: MaybeRefOrGetter<string | null | undefined>,
): ShallowReactive<Set<string>> {
  const fsrs = useFsrs();
  const knowsReading = shallowReactive(new Set<string>());

  watch(
    [() => toValue(writing), knownMinDueWeeks, knownMinRetention],
    async ([value, minDueWeeks, minRetention]) => {
      if (!value) {
        return;
      }

      const now = new Date();
      const minRetentionProb = minRetention / 100;
      const minDueDate = new Date(Date.now() + minDueWeeks * WEEK);

      for (const char of value) {
        if (isKanji(char)) {
          const codepoint = char.codePointAt(0) ?? 0;
          const result = await (
            await db
          ).get("progress", [codepoint, "kanji-read"]);
          if (result) {
            if (result.fsrs.state !== State.Review) {
              continue;
            }

            const r = fsrs.value.get_retrievability(result.fsrs, now, false);

            if (r > minRetentionProb && result.fsrs.due > minDueDate) {
              knowsReading.add(char);
            }
          }
        }
      }
    },
    { immediate: true },
  );

  return knowsReading;
}
