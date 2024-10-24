<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import BookmarkedWords from "../components/BookmarkedWords.vue";
import WordSearchResults from "../components/WordSearchResults.vue";
import KanjiSearchResults from "../components/KanjiSearchResults.vue";
import AppIcon from "../components/AppIcon.vue";

const route = useRoute();
const router = useRouter();

const searchPhrase = computed<string>({
  get() {
    if (typeof route.query.search !== "string") {
      return "";
    }

    return route.query.search;
  },

  set(value: string) {
    router.replace({ query: { search: value || undefined } });
  },
});
</script>

<template>
  <label class="search-field">
    <AppIcon icon="search" class="icon" />

    <input
      v-model="searchPhrase"
      type="search"
      aria-label="search"
      placeholder="Search for new words, kanji, meanings, etc."
    />
  </label>

  <template v-if="searchPhrase">
    <KanjiSearchResults class="kanji-results" :phrase="searchPhrase" />
    <WordSearchResults class="word-results" :phrase="searchPhrase" />
  </template>

  <BookmarkedWords v-else class="bookmark-results" />
</template>

<style scoped>
.search-field {
  align-items: center;
  background: var(--background-strong);
  column-gap: 1ex;
  border: 1px solid var(--accent-color);
  border-radius: 3px;
  display: flex;
  padding: 0.5ex 1ex;

  & input {
    background: var(--background-strong);
    border: 0;
    margin: 0;
    padding: 0;
    flex-grow: 1;
    font-family: inherit;
    font-size: 1.2em;

    &:focus {
      outline: none;
    }
  }

  &::placeholder,
  & .icon {
    color: var(--text-light);
  }

  &:focus-within {
    outline: 1px solid var(--accent-color);

    & .icon {
      color: var(--accent-color);
    }
  }
}

.bookmark-results,
.kanji-results,
.word-results {
  margin-block: 2em;
}
</style>
