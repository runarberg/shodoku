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
import { CardProgress } from "../types.ts";
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

export function useKanjiProgress(
  codepoint: MaybeRefOrGetter<number>,
): ComputedRef<{
  read: CardProgress | null;
  write: CardProgress | null;
}> {
  const { result } = useLiveQuery(
    computed(() => {
      const cardId = toValue(codepoint);

      return async () => {
        const progressStore = (await db).transaction("progress").store;

        const read = await progressStore.get([cardId, "kanji-read"]);
        const write = await progressStore.get([cardId, "kanji-write"]);

        return {
          read: read ?? null,
          write: write ?? null,
        };
      };
    }),

    { read: null, write: null },
  );

  return result;
}

type KanjiRetrievability = number | "learning" | "relearning" | null;

function getRetrievability(
  progress: CardProgress | null,
  fsrs: FSRS,
  now = new Date(),
): KanjiRetrievability {
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

export function useKanjiRetrievability(
  codepoint: MaybeRefOrGetter<number>,
): ComputedRef<{
  read: KanjiRetrievability;
  write: KanjiRetrievability;
} | null> {
  const fsrs = useFsrs();
  const progress = useKanjiProgress(codepoint);

  const { result } = useLiveQuery(
    computed(() => {
      const fsrsValue = fsrs.value;
      const { read, write } = progress.value;

      return async () => {
        const now = new Date();
        return {
          read: getRetrievability(read, fsrsValue, now),
          write: getRetrievability(write, fsrsValue, now),
        };
      };
    }),

    { read: null, write: null },
  );

  return result;
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
