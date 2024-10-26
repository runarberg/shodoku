<script setup lang="ts">
import DeckKanjiCardItem from "./DeckKanjiCardItem.vue";

defineProps<{
  kanji: number[];
}>();
</script>

<template>
  <ol class="kanji-list">
    <li v-for="kanji of kanji" :key="kanji" class="kanji">
      <DeckKanjiCardItem :codepoint="kanji" />
    </li>
  </ol>
</template>

<style scoped>
.kanji-list {
  column-gap: 1ex;
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  margin: 0;
  padding-inline-start: 1em;
  row-gap: 1em;
}
</style>
