<script setup lang="ts">
import DeckKanjiCardItem from "./DeckKanjiCardItem.vue";

defineProps<{
  kanji: number[];
}>();
</script>

<template>
  <ol class="kanji-list">
    <li v-for="codepoint of kanji" :key="codepoint" class="kanji">
      <DeckKanjiCardItem type="kanji" :codepoint="codepoint" />
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
