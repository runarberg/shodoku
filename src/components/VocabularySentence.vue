<script setup lang="ts">
import { computed } from "vue";

import { useHighKanjiReadingRetrievability } from "../helpers/fsrs.ts";
import { useSentence } from "../helpers/sentences.ts";
import { wordRoute } from "../router.ts";

import VocabularyWordFurigana from "./VocabularyWordFurigana.vue";
import { isKanji } from "../helpers/text";
import { Furigana, SentenceWord } from "../types";

const props = defineProps<{
  sentenceId: number;
  hideKanji?: string | null;
  hideReading?: string | null;
  hideMeaning?: boolean;
}>();

const sentence = useSentence(() => props.sentenceId);

const proficientKanji = useHighKanjiReadingRetrievability(
  () => sentence.value?.sentence
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

const furigana = computed(() => {
  return (word: SentenceWord): Furigana =>
    word.furigana.map(({ ruby, rt }) => {
      if (!rt) {
        return { ruby };
      }

      if (knowsRuby.value(ruby)) {
        return { ruby };
      }

      return { ruby, rt };
    });
});
</script>

<template>
  <div v-if="sentence" class="vocabulary-sentence">
    <p lang="ja" class="sentence">
      <component
        :is="word.word ? 'RouterLink' : 'span'"
        v-for="word of sentence.words"
        :key="word.word"
        :to="wordRoute(word.word)"
        class="word"
      >
        <VocabularyWordFurigana
          :furigana="furigana(word)"
          :hide-kanji="hideKanji ? true : false"
          :hide-reading="hideReading ? true : false"
          :kanji="hideKanji ?? hideReading"
        />
      </component>
    </p>

    <p v-show="!hideMeaning" lang="en" class="translation">
      {{ sentence.meaning }}
    </p>
  </div>
</template>

<style scoped>
.vocabulary-sentence {
  font-size: 1rem;
}

.sentence,
.translation {
  margin: 0;
}

.word {
  color: inherit;
  text-decoration: none;
}
</style>
