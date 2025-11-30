import { computed, MaybeRefOrGetter, Ref, ref, toValue, watch } from "vue";

import { Word, WordReading, WordWriting } from "../types.ts";
import { useHighKanjiReadingProficiency } from "./fsrs.ts";
import { isKanji } from "./text.ts";

export function useWord(
  wordId: MaybeRefOrGetter<number | null>,
): Ref<Word | null> {
  const wordInfo = ref<Word | null>(null);

  watch(
    () => toValue(wordId),
    async (id) => {
      if (!id) {
        wordInfo.value = null;
        return;
      }

      const response = await fetch(`/data/words-v1/${id}.json`);
      if (
        !response.ok ||
        !response.headers.get("Content-Type")?.startsWith("application/json")
      ) {
        // eslint-disable-next-line no-console
        console.error("failed getting word:", wordId);
        return;
      }
      try {
        const data = await response.json();
        wordInfo.value = data;
      } catch {
        // eslint-disable-next-line no-console
        console.error("failed getting word:", wordId);
      }
    },
    { immediate: true },
  );

  return wordInfo;
}

export function useWordSetenceIds(
  wordId: MaybeRefOrGetter<number | null>,
): Ref<number[]> {
  const sentenceIds = ref<number[]>([]);

  watch(
    () => toValue(wordId),
    async (id) => {
      if (!id) {
        sentenceIds.value = [];
        return;
      }

      const response = await fetch(`/data/words-sentences-v1/${id}.json`);
      if (
        !response.ok ||
        !response.headers.get("Content-Type")?.startsWith("application/json")
      ) {
        // eslint-disable-next-line no-console
        console.error("failed getting sentences for word:", id);
        return;
      }

      try {
        const data = await response.json();
        sentenceIds.value = data;
      } catch {
        // eslint-disable-next-line no-console
        console.error("failed getting sentences for word:", id);
      }
    },
    { immediate: true },
  );

  return sentenceIds;
}

type UseWordFuriganaOptions = {
  kanji?: MaybeRefOrGetter<string | null | undefined>;
  forceReading?: MaybeRefOrGetter<boolean>;
};

function useWordWriting(
  word: MaybeRefOrGetter<Word | null | undefined>,
  options: UseWordFuriganaOptions = {},
) {
  return computed(() => {
    const kanji = toValue(options.kanji);
    const { writings } = toValue(word) ?? {};

    if (!writings) {
      return null;
    }

    let selected: WordWriting | null = null;

    for (const writing of writings) {
      if (!selected) {
        selected = writing;
        continue;
      }

      if (kanji) {
        const hasKanji = writing.text.includes(kanji);

        if (!hasKanji) {
          continue;
        }

        if (!selected?.text.includes(kanji)) {
          selected = writing;
          continue;
        }
      }

      if (
        writing.priority?.freq &&
        writing.priority.freq <
          (selected.priority?.freq ?? Number.POSITIVE_INFINITY)
      ) {
        selected = writing;
      }
    }

    return selected?.text;
  });
}

function useWordReading(word: MaybeRefOrGetter<Word | null | undefined>) {
  return computed(() => {
    const { readings } = toValue(word) ?? {};

    if (!readings) {
      return null;
    }

    let selected: WordReading | null = null;

    for (const reading of readings) {
      if (!selected) {
        selected = reading;
        continue;
      }

      if (
        reading.priority?.freq &&
        reading.priority.freq <
          (selected.priority?.freq ?? Number.POSITIVE_INFINITY)
      ) {
        selected = reading;
      }
    }

    return selected?.text;
  });
}

export function useWordFurigana(
  word: MaybeRefOrGetter<Word | null | undefined>,
  options: UseWordFuriganaOptions = {},
) {
  const writing = useWordWriting(word, options);
  const reading = useWordReading(word);

  const proficientKanji = useHighKanjiReadingProficiency(() =>
    toValue(word)
      ?.writings?.map(({ text }) => text)
      .join(""),
  );

  const knowsRuby = computed(() => {
    const forceReading = toValue(options.forceReading);
    const targetKanji = toValue(options.kanji);

    return (ruby: string): boolean => {
      if (forceReading && targetKanji && ruby.includes(targetKanji)) {
        return false;
      }

      for (const char of ruby) {
        if (isKanji(char) && !proficientKanji.has(char)) {
          return false;
        }
      }

      return true;
    };
  });

  return computed(() => {
    const { furigana } = toValue(word) ?? {};

    let found;

    if (!reading.value || !writing.value) {
      found = furigana?.at(0);
    } else {
      found = furigana?.find(
        (other) =>
          other.writing === writing.value && other.reading === reading.value,
      );
    }

    if (!found) {
      found = furigana?.at(0);
    }

    const result = found?.furigana ?? [
      { ruby: writing.value ?? reading.value ?? "" },
    ];

    let wasProficient = false;
    return result.map(({ ruby, rt }) => {
      const lastWasProficient = wasProficient;
      wasProficient = false;

      if (!rt) {
        return { ruby };
      }

      if (ruby === "々" && lastWasProficient) {
        return { ruby };
      }

      if (knowsRuby.value(ruby)) {
        wasProficient = true;
        return { ruby };
      }

      return { ruby, rt };
    });
  });
}
