<script setup lang="ts">
import { useSentence } from "../helpers/sentences";
import { wordRoute } from "../router";
import VocabularyWordFurigana from "./VocabularyWordFurigana.vue";

const props = defineProps<{
  sentenceId: number;
  hideKanji?: string | null;
  hideReading?: string | null;
  hideMeaning?: boolean;
}>();

const sentence = useSentence(() => props.sentenceId);
</script>

<template>
  <div v-if="sentence">
    <p lang="ja" class="sentence">
      <component
        :is="word.word ? 'RouterLink' : 'span'"
        v-for="word of sentence.words"
        :key="word.word"
        :to="wordRoute(word.word)"
        class="word"
      >
        <VocabularyWordFurigana
          :furigana="word.furigana"
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
.sentence,
.translation {
  margin: 0;
}

.word {
  color: inherit;
  text-decoration: none;
}
</style>
