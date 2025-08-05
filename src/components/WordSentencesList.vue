<script setup lang="ts">
import { useWordSetenceIds } from "../helpers/words.ts";
import VocabularySentence from "./VocabularySentence.vue";

const props = defineProps<{
  wordId: number;
}>();

const sentenceIds = useWordSetenceIds(() => props.wordId);
</script>

<template>
  <section v-if="sentenceIds.length > 0">
    <h3 class="title">Sentences ({{ sentenceIds.length }})</h3>

    <ul class="sentence-list">
      <li
        v-for="sentenceId of sentenceIds"
        :key="sentenceId"
        class="sentence-item"
      >
        <VocabularySentence :sentence-id="sentenceId" />
      </li>
    </ul>
  </section>
</template>

<style scoped>
.sentence-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.title {
  margin-block: 0 1ex;
}

.sentence-item:not(:first-child) {
  margin-block-start: 1em;
}
</style>
