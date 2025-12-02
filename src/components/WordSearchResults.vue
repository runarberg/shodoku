<script setup lang="ts">
import { vIntersectionObserver } from "@vueuse/components";
import { computed, ref } from "vue";

import { useWordSearch } from "../helpers/search.ts";
import WordSearchResultItem from "./WordSearchResultItem.vue";

const PAGE_SIZE = 15;

const props = defineProps<{
  phrase: string;
}>();

const wordResults = useWordSearch(() => props.phrase);

const pageLimit = ref(PAGE_SIZE);
const shownResults = computed(() => wordResults.slice(0, pageLimit.value));

function nextPage() {
  pageLimit.value += PAGE_SIZE;
}

function handleNextPageIntersecting([
  { isIntersecting },
]: IntersectionObserverEntry[]) {
  if (isIntersecting) {
    nextPage();
  }
}
</script>

<template>
  <section class="word-search-results">
    <h3>Words</h3>

    <ul class="results-list">
      <li v-for="result of shownResults" :key="result.id">
        <WordSearchResultItem :result="result" />
      </li>
    </ul>

    <button
      v-if="pageLimit < wordResults.length"
      v-intersection-observer="handleNextPageIntersecting"
      class="next-page-button"
      @click="nextPage()"
    >
      Load More
    </button>
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
