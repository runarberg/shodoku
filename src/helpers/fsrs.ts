import { fsrs, generatorParameters, State } from "ts-fsrs";
import {
  ComputedRef,
  computed,
  MaybeRefOrGetter,
  shallowReactive,
  ShallowReactive,
  toValue,
  watch,
} from "vue";

import { fsrsFuzzEnabled } from "../store/reviews.ts";
import { db } from "../db/index.ts";

import { useLiveQuery } from "./db.ts";
import { isKanji } from "./text";

export function useFsrs() {
  return computed(() => {
    const params = generatorParameters({
      enable_fuzz: fsrsFuzzEnabled.value,
    });

    return fsrs(params);
  });
}

type KanjiRetrievability = {
  read: number | null;
  write: number | null;
};

export function useKanjiRetrievability(
  codepoint: MaybeRefOrGetter
): ComputedRef<KanjiRetrievability | null> {
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
          read: read
            ? fsrs.value.get_retrievability(read.fsrs, now, false)
            : null,

          write: write
            ? fsrs.value.get_retrievability(write.fsrs, now, false)
            : null,
        };
      };
    })
  );

  return result;
}

export function useHighKanjiReadingRetrievability(
  writing: MaybeRefOrGetter<string | null | undefined>
): ShallowReactive<Set<string>> {
  const fsrs = useFsrs();
  const knowsReading = shallowReactive(new Set<string>());

  watch(
    () => toValue(writing),
    async (value) => {
      if (!value) {
        return;
      }

      const now = new Date();

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

            if (r > 0.99) {
              knowsReading.add(char);
            }
          }
        }
      }
    },
    { immediate: true }
  );

  return knowsReading;
}
