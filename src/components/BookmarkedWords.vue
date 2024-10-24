<script setup lang="ts">
import { vIntersectionObserver } from "@vueuse/components";
import { asyncComputed } from "@vueuse/core";
import { ref } from "vue";

import { db } from "../db/index.ts";
import BookmarkedWordListItem from "./BookmarkedWordListItem.vue";

const wordIds = asyncComputed(async () => {
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

const pageLimit = ref(20);

function nextPage() {
  pageLimit.value += 20;
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
        <BookmarkedWordListItem :word-id="wordId" />
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
