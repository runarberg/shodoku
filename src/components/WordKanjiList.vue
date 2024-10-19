<script setup lang="ts">
import { computed } from "vue";

import { Word } from "../types.ts";
import { isKanji } from "../helpers/text";
import WordKanjiListItem from "./WordKanjiListItem.vue";

const props = defineProps<{
  word: Word;
}>();

const kanjiInWord = computed<Set<string>>(() => {
  const kanji = new Set<string>();

  if (!props.word.writings) {
    return kanji;
  }

  for (const writing of props.word.writings) {
    if (writing.irregular || writing.outdated || writing.searchOnly) {
      continue;
    }

    for (const char of writing.text) {
      if (isKanji(char)) {
        kanji.add(char);
      }
    }
  }

  return kanji;
});
</script>

<template>
  <section v-if="kanjiInWord.size > 0">
    <h3>Kanji ({{ kanjiInWord.size }})</h3>

    <ul class="kanji-list">
      <li v-for="kanji of kanjiInWord">
        <WordKanjiListItem :kanji="kanji" />
      </li>
    </ul>
  </section>
</template>

<style scoped>
.kanji-list {
  display: grid;
  gap: 1.5em 1em;
  grid-template-columns: repeat(3, 1fr);
  list-style: none;
  margin: 0;
  padding: 0;

  @media screen and (max-width: 60ch) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media screen and (max-width: 45ch) {
    display: flex;
    flex-direction: column;
  }
}
</style>
