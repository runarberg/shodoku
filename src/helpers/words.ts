import { computed, MaybeRefOrGetter, ref, Ref, toValue, watch } from "vue";

import { Word, WordReading, WordWriting } from "../types.ts";
import { isKanji } from "./text";
import { useHighKanjiReadingRetrievability } from "./fsrs";

export function useWord(
  wordId: MaybeRefOrGetter<number | null>
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
      const data = await response.json();

      wordInfo.value = data;
    },
    { immediate: true }
  );

  return wordInfo;
}

export function useWordSetenceIds(
  wordId: MaybeRefOrGetter<number | null>
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
      const data = await response.json();

      sentenceIds.value = data;
    },
    { immediate: true }
  );

  return sentenceIds;
}

type UseWordFuriganaOptions = {
  kanji?: MaybeRefOrGetter<string | null | undefined>;
};

function useWordWriting(
  word: MaybeRefOrGetter<Word | null | undefined>,
  options: UseWordFuriganaOptions = {}
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

      if (kanji && !writing.text.includes(kanji)) {
        continue;
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
  options: UseWordFuriganaOptions = {}
) {
  const writing = useWordWriting(word, options);
  const reading = useWordReading(word);

  const proficientKanji = useHighKanjiReadingRetrievability(() =>
    toValue(word)
      ?.writings?.map(({ text }) => text)
      .join("")
  );

  const knowsRuby = computed(() => {
    return (ruby: string): boolean => {
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
          other.writing === writing.value && other.reading === reading.value
      );
    }

    if (!found) {
      found = furigana?.at(0);
    }

    const result = found?.furigana ?? [
      { ruby: writing.value ?? reading.value ?? "" },
    ];

    return result.map(({ ruby, rt }) => {
      if (!rt) {
        return { ruby };
      }

      if (knowsRuby.value(ruby)) {
        return { ruby };
      }

      return { ruby, rt };
    });
  });
}
