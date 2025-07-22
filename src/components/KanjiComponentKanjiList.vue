<script setup lang="ts">
import { ref } from 'vue';

import { vIntersectionObserver } from "@vueuse/components";
import { watch } from 'vue';

import WordKanjiListItem from './WordKanjiListItem.vue';

const props = defineProps<{
  kanjiLiterals: string[];
}>();

const PAGE_SIZE = 40;

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

watch(
  () => props.kanjiLiterals,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      pageLimit.value = PAGE_SIZE;
    }
  }
);
</script>

<template>
  <section>
    <h2>
      Found in Kanji
      <template v-if="kanjiLiterals.length > 0"> ({{ kanjiLiterals.length }})</template>
    </h2>

    <ul v-if="kanjiLiterals.length > 0" class="component-list">
      <li v-for="kanji of kanjiLiterals.slice(0, pageLimit)" :key="kanji">
        <WordKanjiListItem :kanji="kanji" />
      </li>
    </ul>

    <button
      v-if="pageLimit < kanjiLiterals.length"
      v-intersection-observer="handleNextPageIntersecting"
      class="next-page-button"
      @click="nextPage()"
    >
      Load More
    </button>

  </section>
</template>

<style scoped>
.component-list {
  display: grid;
  gap: 1ex;
  grid-template-columns: 1fr 1fr;
  list-style: none;
  margin: 0;
  padding: 0;

  @media screen and (max-width: 60ch) {
    display: flex;
    flex-direction: column;
  }
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
