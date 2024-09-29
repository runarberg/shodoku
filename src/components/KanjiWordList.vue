<script setup lang="ts">
import { KanjiVocab } from "../types";

import WordListItem from "./WordListItem.vue";

defineProps<{
  kanjiVocab: KanjiVocab;
}>();
</script>

<template>
  <section>
    <h2>Words ({{ kanjiVocab.words.length }})</h2>

    <ul class="kanji-word-list">
      <li v-for="word of kanjiVocab.words" :key="word.word">
        <WordListItem :word="word" :kanji="kanjiVocab.literal" />
      </li>
    </ul>
  </section>
</template>

<style scoped>
.kanji-word-list {
  list-style: none;
  padding: 0;
}
</style>
