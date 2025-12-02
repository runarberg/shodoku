<script setup lang="ts">
import { vIntersectionObserver } from "@vueuse/components";
import { computedAsync } from "@vueuse/core";
import { computed, ref, watch } from "vue";

import { db } from "../db/index.ts";
import { KanjiVocab } from "../types.ts";
import WordListItem from "./WordListItem.vue";

const PAGE_SIZE = 10;

const props = defineProps<{
  kanjiVocab: KanjiVocab;
  hideKanji?: boolean;
  hideReading?: boolean;
  hideMeaning?: boolean;
}>();

const wordListsResult = computedAsync(async () => {
  const { words } = props.kanjiVocab;
  const bookmarked = [];
  const rest = [];
  const { store } = (await db).transaction("bookmarked-words");
  for (const word of words) {
    if (await store.count(word)) {
      bookmarked.push(word);
    } else {
      rest.push(word);
    }
  }

  return { bookmarked, rest };
}, null);

const pageLimit = ref(PAGE_SIZE);
const wordLists = computed(() => {
  const limit = pageLimit.value;

  if (wordListsResult.value) {
    const { bookmarked, rest } = wordListsResult.value;
    return [bookmarked, rest.slice(0, limit)];
  }

  return [props.kanjiVocab.words.slice(0, limit)];
});

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

watch(
  () => props.kanjiVocab.codepoint,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      pageLimit.value = PAGE_SIZE;
    }
  },
);
</script>

<template>
  <section>
    <h2>Words ({{ kanjiVocab.words.length }})</h2>

    <ul class="kanji-word-list">
      <template v-for="words of wordLists">
        <li v-for="word of words" :key="word">
          <WordListItem
            :word="word"
            :kanji="kanjiVocab.literal"
            :hide-kanji="hideKanji"
            :hide-reading="hideReading"
            :hide-meaning="hideMeaning"
          />
        </li>
      </template>
    </ul>

    <button
      v-if="pageLimit < kanjiVocab.words.length"
      v-intersection-observer="handleNextPageIntersecting"
      class="next-page-button"
      @click="nextPage()"
    >
      Load More
    </button>
  </section>
</template>

<style scoped>
.kanji-word-list {
  list-style: none;
  padding: 0;
}

.next-page-button {
  background: none;
  border: none;
  color: var(--accent-color);
  cursor: pointer;
  font-family: inherit;
  font-size: 1em;
  font-weight: 600;
}
</style>
