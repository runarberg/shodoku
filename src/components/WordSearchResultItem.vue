<script setup lang="ts">
import { computed } from "vue";

import { hasKanaOrKanji, hasKanji } from "../helpers/text.ts";
import { useWord } from "../helpers/words.ts";
import { wordRoute } from "../router.ts";
import { Furigana, WordMeaning } from "../types.ts";
import type { WordSearchResult } from "../workers/search-words.worker.ts";
import BookmarkWordButton from "./BookmarkWordButton.vue";
import VocabularyWordFurigana from "./VocabularyWordFurigana.vue";
import VocabularyWordMeaning from "./VocabularyWordMeaning.vue";

const props = defineProps<{
  result: WordSearchResult;
}>();

const word = useWord(() => props.result.id);

const reading = computed(() => {
  if (word.value) {
    return word.value.readings?.at(0)?.text;
  }

  return props.result.readings.at(0);
});

const furigana = computed<Furigana | string>(() => {
  const { match, readings, writings } = props.result;

  if (word.value) {
    let found;

    if (hasKanji(match)) {
      found = word.value.furigana?.find((other) => other.writing === match);
    } else if (hasKanaOrKanji(match)) {
      found = word.value.furigana?.find((other) => other.reading === match);
    }

    if (!found) {
      found = word.value.furigana?.at(0);
    }

    if (found) {
      return found.furigana;
    }

    return (
      word.value.writings?.at(0)?.text ??
      word.value.readings?.at(0)?.text ??
      match
    );
  }

  if (hasKanji(match)) {
    return [{ ruby: match, rt: readings.at(0) }];
  }

  const [writing] = writings;

  if (hasKanaOrKanji(match)) {
    if (writing) {
      return [{ ruby: writing, rt: match }];
    }

    return match;
  }

  const [firstReading] = readings;
  if (writing && firstReading) {
    return [{ ruby: firstReading, rt: firstReading }];
  }

  return writing ?? firstReading ?? match;
});

const meaning = computed<WordMeaning | string>(() => {
  const { match, glossary } = props.result;

  if (word.value) {
    if (hasKanaOrKanji(match)) {
      return word.value.meanings?.at(0) ?? glossary.at(0) ?? match;
    }

    const found = word.value.meanings?.find((other) =>
      other.glossary?.includes(match),
    );

    if (found) {
      return found;
    }
  }

  if (hasKanaOrKanji(match)) {
    return glossary.at(0) ?? match;
  }

  return match;
});
</script>

<template>
  <div class="word-search-result-item">
    <BookmarkWordButton
      :word-id="result.id"
      :reading="reading"
      class="bookmark-button"
    />

    <RouterLink :to="wordRoute(result.id)" class="word">
      <template v-if="typeof furigana === 'string'">
        {{ furigana }}
      </template>
      <VocabularyWordFurigana v-else :furigana="furigana" />
    </RouterLink>

    <div class="meaning">
      <template v-if="typeof meaning === 'string'">
        {{ meaning }}
      </template>
      <VocabularyWordMeaning v-else :meaning="meaning" />
    </div>
  </div>
</template>

<style scoped>
.word-search-result-item {
  align-items: start;
  display: grid;
  grid-template:
    "bookmark . word . meaning"
    / auto 0.5ex minmax(0, auto) 1em 1fr;

  & .bookmark-button {
    grid-area: bookmark;
  }

  & .word {
    grid-area: word;
  }

  & .meaning {
    grid-area: meaning;
  }
}

.bookmark-button {
  margin-block-start: 0.3ex;

  .word-search-result-item:has(.word ruby rt) & {
    margin-block-start: 0.9ex;
  }
}

.word {
  color: var(--accent-color);
  display: block;
  font-size: 1.5em;
  font-weight: 500;
  text-decoration: none;

  @media screen and (max-width: 60ch) {
    max-inline-size: 40vw;
  }
}
</style>
