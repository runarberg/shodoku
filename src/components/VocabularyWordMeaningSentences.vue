<script setup lang="ts">
import VocabularySentence from "./VocabularySentence.vue";

withDefaults(
  defineProps<{
    sentenceIds?: number[];
    kanji?: string | null;
    hideKanji?: boolean;
    hideReading?: boolean;
    hideMeaning?: boolean;
  }>(),
  {
    sentenceIds: () => [],
    kanji: null,
  },
);
</script>

<template>
  <ul v-if="sentenceIds.length > 0" class="sentence-list">
    <li v-for="id of sentenceIds" :key="id" class="sentence-item">
      <VocabularySentence
        :sentence-id="id"
        :kanji="kanji"
        :hide-kanji="hideKanji"
        :hide-reading="hideReading"
        :hide-meaning="hideMeaning"
      />
    </li>
  </ul>
</template>

<style scoped>
.sentence-list {
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
