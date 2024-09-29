import {
  computed,
  ComputedRef,
  MaybeRefOrGetter,
  ref,
  shallowReactive,
  toValue,
} from "vue";
import { KanjiInfo } from "../types";

type Radical = {
  id: number;
  literal: string;
  strokes: number;
  meaning: string;
  reading: string;
};

let fetching: Promise<void> | null = null;
let doneFetching = ref(false);

const cache = shallowReactive(new Map<string, Radical>());

async function syncRadicals(): Promise<void> {
  if (doneFetching.value) {
    return;
  }

  if (fetching) {
    return fetching;
  }

  const response = await fetch("/data/radicals.csv");
  const csv = await response.text();

  for (const line of csv.split("\n")) {
    const [id, chars, strokes, meaning, reading] = line.split(",");

    if (!chars) {
      continue;
    }

    const info = {
      id: Number.parseInt(id),
      literal: chars.at(0) ?? "",
      strokes: Number.parseInt(strokes),
      meaning,
      reading,
    };

    for (const literal of chars) {
      cache.set(literal, info);
    }
  }

  doneFetching.value = true;
}

async function tryKanji(literal: string): Promise<void> {
  const codePoint = literal.codePointAt(0);

  if (!codePoint) {
    return;
  }

  const hex = codePoint?.toString(16).padStart(5, "0");
  const response = await fetch(`/data/kanji-v1/${hex}.json`);
  const kanji = (await response.json()) as KanjiInfo;
  const reading =
    kanji.kunYomi.find((kun) => !/[.-]/.test(kun)) ?? kanji.kunYomi.at(0) ?? "";

  cache.set(literal, {
    id: codePoint,
    literal,
    strokes: kanji.strokeCount,
    meaning: kanji.meanings.at(0) ?? "",
    reading,
  });
}

export function useRadical(
  literal: MaybeRefOrGetter<string | null>
): ComputedRef<Radical | null> {
  syncRadicals();

  return computed(() => {
    const value = toValue(literal);

    if (!value) {
      return null;
    }

    const found = cache.get(value);

    if (!found && doneFetching.value) {
      tryKanji(value);
    }

    return found ?? null;
  });
}
