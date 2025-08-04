<script setup lang="ts">
import { computed, ref, useId } from "vue";
import { useRoute, useRouter } from "vue-router";

import AppButton from "../components/AppButton.vue";
import AppIcon from "../components/AppIcon.vue";
import BookmarkedWords from "../components/BookmarkedWords.vue";
import ComponentPicker from "../components/ComponentPicker.vue";
import KanjiSearchResults from "../components/KanjiSearchResults.vue";
import WordSearchResults from "../components/WordSearchResults.vue";

const route = useRoute();
const router = useRouter();

const componentPickerId = useId();
const componentPickerExpanded = ref(false);

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
  <div class="search-field">
    <label class="label">
      <AppIcon icon="search" class="icon" />
    </label>

    <input
      v-model="searchPhrase"
      type="search"
      aria-label="search"
      placeholder="Search for words, kanji, meanings, etc."
    />

    <AppButton
      :filled="componentPickerExpanded"
      :aria-pressed="componentPickerExpanded"
      :aria-controls="componentPickerId"
      aria-label="Component Picker"
      @click="componentPickerExpanded = !componentPickerExpanded"
    >
      部
    </AppButton>
  </div>

  <ComponentPicker
    v-if="componentPickerExpanded"
    :id="componentPickerId"
    @close="componentPickerExpanded = false"
    @select="searchPhrase += $event"
  />

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
