<script setup lang="ts">
import { computed } from "vue";

import { useKanjiSearch } from "../helpers/search.ts";
import { isKanji } from "../helpers/text.ts";

import WordKanjiListItem from "./WordKanjiListItem.vue";

const props = defineProps<{
  phrase: string;
}>();

const kanjiLiterals = computed(() => {
  const literals = new Set<string>();

  for (const char of props.phrase) {
    if (isKanji(char)) {
      literals.add(char);
    }
  }

  return literals;
});

const kanjiResults = useKanjiSearch(() => props.phrase);
</script>

<template>
  <section
    class="kanji-search-results"
    v-if="kanjiLiterals.size > 0 || kanjiResults.length > 0"
  >
    <h3>Kanji</h3>

    <ul v-if="kanjiLiterals.size > 0" class="results-list">
      <li v-for="kanji of kanjiLiterals" :key="kanji">
        <WordKanjiListItem :kanji="kanji" />
      </li>
    </ul>

    <ul v-else class="results-list">
      <li v-for="result of kanjiResults" :key="result.id">
        <WordKanjiListItem :kanji="String.fromCodePoint(result.id)" />
      </li>
    </ul>
  </section>
</template>

<style scoped>
.results-list {
  list-style: none;
  display: grid;
  gap: 1.5em 1em;
  grid-template-columns: repeat(3, 1fr);
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
