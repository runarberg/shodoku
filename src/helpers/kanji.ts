import { MaybeRefOrGetter, ref, Ref, toValue, watch } from "vue";
import { KanjiInfo, KanjiVocab } from "../types";

export function useKanji(
  codepoint: MaybeRefOrGetter<number | null | undefined>
): Ref<KanjiInfo | null> {
  const kanji = ref<KanjiInfo | null>(null);

  watch(
    () => toValue(codepoint),
    async (value) => {
      if (!value) {
        kanji.value = null;
        return;
      }

      if (value === kanji.value?.codepoint) {
        return;
      }

      const hex = value.toString(16).padStart(5, "0");
      const response = await fetch(`/data/kanji-v1/${hex}.json`);
      const data = await response.json();

      kanji.value = data;
    },
    { immediate: true }
  );

  return kanji;
}

export function useKanjiVocab(
  codepoint: MaybeRefOrGetter<number | null | undefined>
): Ref<KanjiVocab | null> {
  const kanjiVocab = ref<KanjiVocab | null>(null);

  watch(
    () => toValue(codepoint),
    async (value) => {
      if (!value) {
        kanjiVocab.value = null;
        return;
      }

      const hex = value.toString(16).padStart(5, "0");
      const response = await fetch(`/data/kanji-vocab-v1/${hex}.json`);
      const data = await response.json();

      kanjiVocab.value = data;
    },
    { immediate: true }
  );

  return kanjiVocab;
}
