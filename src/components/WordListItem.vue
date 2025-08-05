<script setup lang="ts">
import { useWord, useWordSetenceIds } from "../helpers/words.ts";
import BookmarkWordButton from "./BookmarkWordButton.vue";
import VocabularySentence from "./VocabularySentence.vue";
import VocabularyWord from "./VocabularyWord.vue";

const props = defineProps<{
  word: number;
  kanji?: string;
  hideKanji?: boolean;
  hideReading?: boolean;
  hideMeaning?: boolean;
}>();

const wordInfo = useWord(() => props.word);
const sentences = useWordSetenceIds(() => props.word);
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
      class="word-section"
    />

    <section v-if="sentences" aria-label="Sentences" class="sentences-section">
      <ul class="sentences">
        <li v-for="sentence of sentences" :key="sentence" class="sentence-item">
          <VocabularySentence
            :sentence-id="sentence"
            :hide-kanji="hideKanji ? kanji : null"
            :hide-reading="hideReading ? kanji : null"
            :hide-meaning="hideMeaning"
          />
        </li>
      </ul>
    </section>
  </article>
</template>

<style scoped>
.word-list-item {
  display: grid;
  grid-template:
    "bullet . word"
    ".      . sentences"
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

  & .sentences-section {
    grid-area: sentences;
  }
}

.bookmark-button {
  margin-block-start: 0.9ex;

  .word-list-item:has(.word-section ruby rt) & {
    margin-block-start: 0.9em;
  }
}

.sentences {
  border-inline-start: 2px solid
    light-dark(var(--light-gray), var(--medium-gray));
  grid-area: sentences;
  list-style: none;
  padding-inline: 1ex;
}

.sentence-item {
  margin-block: 1em;

  &:first-child {
    margin-block-start: 1ex;
  }

  &:last-child {
    margin-block-end: 1ex;
  }
}
</style>
