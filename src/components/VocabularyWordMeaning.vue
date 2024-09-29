<script setup lang="ts">
import { WordMeaning } from "../types";

import PartOfSpeechTag from "./PartOfSpeechTag.vue";

defineProps<{
  meaning: WordMeaning;
}>();
</script>

<template>
  <div class="vocabulary-word-meaning">
    <div class="meaning-pos">
      <PartOfSpeechTag v-for="pos of meaning.pos" :tag="pos" />
    </div>
    <div class="glossary">
      <span v-for="word of meaning.glossary" class="glossary-word">
        {{ word }}</span
      >
    </div>
  </div>
</template>

<style scoped>
.meaning-pos {
  column-gap: 1ex;
  display: flex;
  flex-wrap: wrap;

  & .pos-tag:not(:last-child)::after {
    content: ",";
  }
}

.glossary {
  display: flex;
  flex-wrap: wrap;
}

.glossary-word:not(:last-child) {
  padding-inline-end: 1ex;

  &::after {
    content: ";";
  }
}
</style>
