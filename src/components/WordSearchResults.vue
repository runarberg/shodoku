<script setup lang="ts">
import { useWordSearch } from "../helpers/search";
import WordSearchResultItem from "./WordSearchResultItem.vue";

const props = defineProps<{
  phrase: string;
}>();

const wordResults = useWordSearch(() => props.phrase);
</script>

<template>
  <section class="word-search-results">
    <h3>Words</h3>

    <ul class="results-list">
      <li v-for="result of wordResults" :key="result.id">
        <WordSearchResultItem :result="result" />
      </li>
    </ul>
  </section>
</template>

<style scoped>
.results-list {
  list-style: none;
  margin: 0;
  padding: 0;

  & > li:not(:first-child) {
    margin-block-start: 1em;
  }
}
</style>
