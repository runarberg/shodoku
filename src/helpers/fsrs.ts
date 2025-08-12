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

type KanjiRetrievability = number | "learning" | "relearning" | null;

function getRetrievability(
  progress: CardProgress | undefined,
  fsrs: FSRS,
  now = new Date(),
): KanjiRetrievability {
  if (!progress) {
    return null;
  }

  if (progress.fsrs.state === 1) {
    return "learning";
  }

  if (progress.fsrs.state === 3) {
    return "relearning";
  }

  return fsrs.get_retrievability(progress.fsrs, now, false);
}

export function useKanjiRetrievability(
  codepoint: MaybeRefOrGetter,
): ComputedRef<{
  read: KanjiRetrievability;
  write: KanjiRetrievability;
} | null> {
  const fsrs = useFsrs();
  const { result } = useLiveQuery(
    computed(() => {
      const cardId = toValue(codepoint);

      return async () => {
        const progressStore = (await db).transaction("progress").store;

        const read = await progressStore.get([cardId, "kanji-read"]);
        const write = await progressStore.get([cardId, "kanji-write"]);

        const now = new Date();

        return {
          read: getRetrievability(read, fsrs.value, now),
          write: getRetrievability(write, fsrs.value, now),
        };
      };
    }),
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
