<script setup lang="ts">
import { ref, watch } from "vue";

import SentenceListItem from "./SentenceListItem.vue";
import VocabularyWord from "./VocabularyWord.vue";

const props = defineProps<{
  word: { word: number; sentences?: number[] };
  kanji?: string;
}>();

const wordInfo = ref(null);

watch(
  () => props.word,
  async ({ word: id }) => {
    const response = await fetch(`/data/words-v1/${id}.json`);
    const data = await response.json();

    wordInfo.value = data;
  },
  { immediate: true }
);
</script>

<template>
  <article class="word-list-item">
    <VocabularyWord v-if="wordInfo" :word="wordInfo" :kanji="kanji" />

    <section v-if="word.sentences" aria-label="Sentences">
      <ul class="sentences">
        <li
          v-for="sentence of word.sentences"
          :key="sentence"
          class="sentence-item"
        >
          <SentenceListItem :sentence-id="sentence" />
        </li>
      </ul>
    </section>
  </article>
</template>

<style scoped>
.word-list-item {
  margin-block-start: 2em;
}

.sentences {
  border-inline-start: 2px solid lightgray;
  list-style: none;
  margin-block-start: 1em;
  margin-inline: 1ex;
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
