<script setup lang="ts">
import { computed } from "vue";

import { useHighKanjiReadingProficiency } from "../helpers/fsrs.ts";
import { useSentence } from "../helpers/sentences.ts";
import { isKanji } from "../helpers/text.ts";
import { wordRoute } from "../router.ts";
import { Furigana, SentenceWord } from "../types.ts";
import VocabularyWordFurigana from "./VocabularyWordFurigana.vue";

const props = defineProps<{
  sentenceId: number;
  kanji?: string | null;
  hideKanji?: boolean;
  hideReading?: boolean;
  hideMeaning?: boolean;
}>();

const sentence = useSentence(() => props.sentenceId);

const proficientKanji = useHighKanjiReadingProficiency(
  () => sentence.value?.sentence,
);

const knowsRuby = computed(() => {
  return (ruby: string): boolean => {
    if (props.kanji && props.hideKanji && ruby.includes(props.kanji)) {
      // writing practice.
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

const furigana = computed(() => {
  return (word: SentenceWord): Furigana => {
    let wasProficient = false;

    return word.furigana.map(({ ruby, rt }) => {
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
  };
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
          :hide-kanji="hideKanji"
          :hide-reading="hideReading"
          :kanji="kanji"
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

.translation {
  font-size: 0.95em;
  color: var(--text-medium);
}

.word {
  color: inherit;
  text-decoration: none;
}
</style>
