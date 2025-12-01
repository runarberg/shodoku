<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { pipe } from "yta";
import { groupBy } from "yta/sync";

import BookmarkWordButton from "../components/BookmarkWordButton.vue";
import VocabularyWordFurigana from "../components/VocabularyWordFurigana.vue";
import VocabularyWordMeaning from "../components/VocabularyWordMeaning.vue";
import VocabularyWordMeaningSentences from "../components/VocabularyWordMeaningSentences.vue";
import WordKanjiList from "../components/WordKanjiList.vue";
import WordWritingSelect from "../components/WordWritingSelect.vue";
import {
  useWord,
  useWordFurigana,
  useWordSetenceIndex,
} from "../helpers/words.ts";
import { Furigana } from "../types.ts";

const route = useRoute();
const wordId = computed(() => {
  const value = route.params.wordId;

  if (typeof value !== "string") {
    return null;
  }

  const id = Number.parseInt(value);

  if (!Number.isFinite(id)) {
    return null;
  }

  return id;
});

const word = useWord(wordId);
const preferredFurigana = useWordFurigana(word);
const selectedFurigana = ref<Furigana | string | null>(null);

const firstMeaning = computed(() => word.value?.meanings?.at(0));
const additionalMeanings = computed(() => word.value?.meanings?.slice(1));

const sentenceIndex = useWordSetenceIndex(wordId);
const meaningSentenceMap = computed(() => {
  if (!sentenceIndex.value) {
    return null;
  }

  return pipe(
    sentenceIndex.value,
    groupBy(
      (entry) => entry.meaning,
      (entry) => entry.sentence,
    ),
  );
});

watch(wordId, (newId, oldId) => {
  if (newId !== oldId) {
    selectedFurigana.value = null;
  }
});
</script>

<template>
  <article v-if="word" class="world-view-article">
    <header class="header">
      <h2 class="title">
        <template v-if="typeof selectedFurigana === 'string'">
          {{ selectedFurigana }}
        </template>

        <VocabularyWordFurigana
          v-else
          :furigana="selectedFurigana || preferredFurigana"
          link-kanji
        />
      </h2>

      <div class="actions">
        <BookmarkWordButton
          :word-id="word.id"
          :reading="word.readings?.at(0)?.text"
        />

        <WordWritingSelect
          v-model="selectedFurigana"
          :word="word"
          :default-furigana="preferredFurigana"
          class="section"
        />
      </div>
    </header>

    <div v-if="firstMeaning" class="section">
      <VocabularyWordMeaning :meaning="firstMeaning" />
      <VocabularyWordMeaningSentences
        :sentence-ids="meaningSentenceMap?.get(1)"
      />
    </div>

    <WordKanjiList v-if="word" :word="word" class="section" />

    <section
      v-if="additionalMeanings && additionalMeanings.length > 0"
      class="section"
    >
      <h3>Other Meanings</h3>

      <ul class="meaning-list">
        <li v-for="(meaning, i) of word.meanings" :key="i">
          <VocabularyWordMeaning :meaning="meaning" />
          <VocabularyWordMeaningSentences
            :sentence-ids="meaningSentenceMap?.get(i + 2)"
          />
        </li>
      </ul>
    </section>
  </article>
</template>

<style scoped>
.header {
  align-items: start;
  column-gap: 1em;
  display: flex;

  & .title {
    font-size: 4em;
    font-weight: 500;
    margin: 0;
    max-inline-size: calc(100vw - 1.5em);
  }

  & .actions {
    align-items: end;
    display: flex;
    flex-direction: column;
    margin-inline-start: auto;
    row-gap: 1ex;
  }
}

.world-view-article > .section {
  margin-block: 1em 1.5em;
}

.meaning-list {
  list-style: none;
  margin: 0;
  padding: 0;

  & > li:not(:first-child) {
    margin-block-start: 1ex;
  }
}
</style>
