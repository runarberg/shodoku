<script lang="ts" setup>
import { KanaInfoVocabularyWord } from "../types.ts";
import KanaVocabularyWord from "./KanaVocabularyWord.vue";

defineProps<{
  vocab: KanaInfoVocabularyWord[];
  hideRomaji?: boolean;
  hideKana?: boolean;
  targetKana?: string;
}>();
</script>

<template>
  <section>
    <h2>Examples</h2>

    <ul class="vocab-list">
      <li v-for="word of vocab" :key="word.wordId || word.kana">
        <KanaVocabularyWord
          class="example-word"
          :word="word"
          :hide-romaji="hideRomaji"
          :hide-kana="hideKana"
          :target-kana="targetKana"
        />
      </li>
    </ul>
  </section>
</template>

<style scoped>
.vocab-list {
  list-style: none;
  margin: 0;
  padding: 0;

  & > li:not(:first-child) {
    margin-block-start: 1ex;
  }
}

.example-word {
  inline-size: max-content;
}
</style>
