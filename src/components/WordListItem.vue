<script setup lang="ts">
import { useWord, useWordSetenceIndex } from "../helpers/words.ts";
import BookmarkWordButton from "./BookmarkWordButton.vue";
import VocabularyWord from "./VocabularyWord.vue";

const props = defineProps<{
  word: number;
  kanji?: string;
  hideKanji?: boolean;
  hideReading?: boolean;
  hideMeaning?: boolean;
}>();

const wordInfo = useWord(() => props.word);
const sentenceIndex = useWordSetenceIndex(() => props.word);
</script>

<template>
  <article class="word-list-item">
    <aside class="bullet">
      <BookmarkWordButton
        :word-id="word"
        :reading="wordInfo?.readings?.at(0)?.text"
        class="bookmark-button"
      />
    </aside>

    <VocabularyWord
      v-if="wordInfo"
      :word="wordInfo"
      :kanji="kanji"
      :hide-kanji="hideKanji"
      :hide-reading="hideReading"
      :hide-meaning="hideMeaning"
      :sentence-index="sentenceIndex"
      class="word-section"
    />
  </article>
</template>

<style scoped>
.word-list-item {
  display: grid;
  grid-template:
    "bullet . word"
    / auto 0.5ex 1fr;
  margin-block-start: 2em;
  justify-content: start;

  & .bullet {
    display: flex;
    grid-area: bullet;
    flex-direction: column;
  }

  & .word-section {
    grid-area: word;
  }
}

.bookmark-button {
  margin-block-start: 0.9ex;

  .word-list-item:has(.word-section ruby rt) & {
    margin-block-start: 0.9em;
  }
}
</style>
