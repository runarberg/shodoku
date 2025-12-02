<script setup lang="ts">
import { vIntersectionObserver } from "@vueuse/components";
import { computedAsync } from "@vueuse/core";
import { ref } from "vue";

import { db } from "../db/index.ts";
import WordListItem from "./WordListItem.vue";

const PAGE_SIZE = 10;

const wordIds = computedAsync(async () => {
  const result = [];
  const cursors = (await db)
    .transaction("bookmarked-words")
    .store.index("bookmarkedAt")
    .iterate(null, "prev");

  for await (const cursor of cursors) {
    result.push(cursor.primaryKey);
  }

  return result;
}, []);

const pageLimit = ref(PAGE_SIZE);

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
    <h3>Bookmarked Words</h3>

    <ul class="results-list">
      <li v-for="wordId of wordIds.slice(0, pageLimit)" :key="wordId">
        <WordListItem :word="wordId" />
      </li>
    </ul>

    <button
      v-if="pageLimit < wordIds.length"
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
