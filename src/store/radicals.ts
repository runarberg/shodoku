import { defineStore } from "pinia";
import {
  computed,
  ComputedRef,
  MaybeRefOrGetter,
  ref,
  shallowReactive,
  toValue,
  watchEffect,
} from "vue";

import { KanjiInfo, Radical } from "../types.ts";

function* fromCSV(csv: string): Iterable<[string, Radical]> {
  for (const line of csv.split("\n")) {
    const [id, chars, strokes, meaning, reading] = line.split(",");

    if (!chars) {
      continue;
    }

    const radical = {
      id: Number.parseInt(id),
      literal: chars.at(0) ?? "",
      strokes: Number.parseInt(strokes),
      meaning,
      reading,
    };

    for (const literal of chars) {
      yield [literal, radical];
    }
  }
}

export const useRadicalsStore = defineStore("radicals", () => {
  const syncing = ref(false);
  const error = ref<unknown>(null);
  const radicals = shallowReactive(new Map<string, Radical>());

  async function sync(): Promise<void> {
    if (syncing.value) {
      return;
    }

    syncing.value = true;
    error.value = null;

    try {
      const response = await fetch("/data/radicals.csv");
      const csv = await response.text();

      for (const [char, info] of fromCSV(csv)) {
        radicals.set(char, info);
      }
    } catch (syncError) {
      error.value = syncError;
    } finally {
      syncing.value = false;
    }
  }

  async function tryKanji(literal: string): Promise<void> {
    const codePoint = literal.codePointAt(0);

    if (!codePoint) {
      return;
    }

    if (codePoint === 0x4e1a) {
      // Missing component
      radicals.set(literal, {
        id: codePoint,
        literal,
        strokes: 5,
        meaning: "North",
        reading: "ほく",
      });
    }

    const hex = codePoint?.toString(16).padStart(5, "0");
    const response = await fetch(`/data/kanji-v1/${hex}.json`);
    const kanji = (await response.json()) as KanjiInfo;
    const reading =
      kanji.kunYomi.find((kun) => !/[.-]/.test(kun)) ??
      kanji.kunYomi.at(0) ??
      "";

    radicals.set(literal, {
      id: codePoint,
      literal,
      strokes: kanji.strokeCount,
      meaning: kanji.meanings.at(0) ?? "",
      reading,
    });
  }

  sync();

  return {
    radicals,
    sync,
    syncing,
    tryKanji,
  };
});

export function useRadical(
  literal: MaybeRefOrGetter<string | null>
): ComputedRef<Radical | null> {
  const store = useRadicalsStore();

  watchEffect(() => {
    const value = toValue(literal);

    if (value && !store.syncing && !store.radicals.has(value)) {
      // Maybe this component is another kanji not in the radical
      // dicationary.
      store.tryKanji(value);
    }
  });

  return computed(() => {
    const value = toValue(literal);

    if (!value) {
      return null;
    }

    return store.radicals.get(value) ?? null;
  });
}
