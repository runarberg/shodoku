<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { pipe } from "yta";
import { groupBy } from "yta/sync";

import { hasKanjiRE } from "../helpers/text.ts";
import { useWordFurigana } from "../helpers/words.ts";
import { wordRoute } from "../router.ts";
import { Furigana, Word, WordSentenceIndex } from "../types.ts";
import VocabularyWordFurigana from "./VocabularyWordFurigana.vue";
import VocabularyWordMeaning from "./VocabularyWordMeaning.vue";
import VocabularyWordMeaningSentences from "./VocabularyWordMeaningSentences.vue";
import WordWritingSelect from "./WordWritingSelect.vue";

const props = withDefaults(
  defineProps<{
    word: Word;
    kanji?: string | null;
    hideKanji?: boolean;
    hideReading?: boolean;
    hideMeaning?: boolean;
    sentenceIndex?: WordSentenceIndex | null;
  }>(),
  {
    kanji: null,
    hideKanji: false,
    hideReading: false,
    hideMeaning: false,
    sentenceIndex: null,
  },
);

const meanings = computed(() => {
  const { kanji, word } = props;

  if (!word.meanings) {
    return [];
  }

  if (!kanji) {
    return word.meanings;
  }

  return word.meanings.filter((meaning) => {
    if (
      meaning.info &&
      meaning.info.startsWith("esp. ") &&
      hasKanjiRE.test(meaning.info)
    ) {
      return meaning.info.includes(kanji);
    }

    if (!meaning.useWithWriting) {
      return true;
    }

    return meaning.useWithWriting.some((writing) => writing.includes(kanji));
  });
});

const furigana = useWordFurigana(() => props.word, {
  kanji: () => props.kanji,
  // writing practice, prevent hiding furigana for proficient reading.
  forceReading: () => props.hideKanji,
});

const meaning = computed(() => meanings.value.at(0));
const selectedFurigana = ref<Furigana | string | null>(null);

const additionalMeanings = computed(() => meanings.value.slice(1));
const additionalMeaningsToggledOnce = ref(false);

const meaningSentenceMap = computed(() => {
  if (!props.sentenceIndex) {
    return null;
  }

  return pipe(
    props.sentenceIndex,
    groupBy(
      (entry) => entry.meaning,
      (entry) => entry.sentence,
    ),
  );
});

watch(
  () => props.word.id,
  (newId, oldId) => {
    if (newId !== oldId) {
      selectedFurigana.value = null;
    }
  },
);
</script>

<template>
  <div class="vocabulary-word">
    <p class="word" lang="ja">
      <RouterLink :to="wordRoute(word.id)" class="word-link">
        <template v-if="typeof selectedFurigana === 'string'">
          {{ selectedFurigana }}
        </template>

        <VocabularyWordFurigana
          v-else
          :furigana="selectedFurigana || furigana"
          :hide-kanji="hideKanji"
          :hide-reading="hideReading"
          :kanji="kanji"
        />
      </RouterLink>
    </p>

    <div class="meaning">
      <VocabularyWordMeaning
        v-if="meaning && !hideMeaning"
        :meaning="meaning"
      />
    </div>

    <div class="extra">
      <VocabularyWordMeaningSentences
        :sentence-ids="meaningSentenceMap?.get(1)"
        :kanji="kanji"
        :hide-kanji="hideKanji"
        :hide-reading="hideReading"
        :hide-meaning="hideMeaning"
      />

      <details
        v-if="additionalMeanings.length > 0"
        class="additional-meanings-details"
        @toggle="additionalMeaningsToggledOnce = true"
      >
        <summary>{{ additionalMeanings.length }} more</summary>

        <ul class="additional-meanings">
          <li
            v-for="(additionalMeaning, i) of additionalMeanings"
            :key="i"
            class="additional-meaning-item"
          >
            <VocabularyWordMeaning
              v-if="!hideMeaning"
              :meaning="additionalMeaning"
            />
            <VocabularyWordMeaningSentences
              v-if="additionalMeaningsToggledOnce"
              :sentence-ids="meaningSentenceMap?.get(i + 2)"
              :kanji="kanji"
              :hide-kanji="hideKanji"
              :hide-reading="hideReading"
              :hide-meaning="hideMeaning"
            />
          </li>
        </ul>
      </details>
    </div>

    <div class="actions">
      <WordWritingSelect
        v-if="!hideKanji && !hideReading"
        v-model="selectedFurigana"
        :word="word"
        :default-furigana="furigana"
      />
    </div>
  </div>
</template>

<style scoped>
.vocabulary-word {
  column-gap: 1em;
  display: grid;
  grid-template:
    "word meaning actions"
    "extra extra extra"
    / fit-content(50%) 1fr auto;

  @media screen and (max-width: 60ch) {
    column-gap: 0.5ex;
    grid-template:
      "word actions"
      "meaning meaning"
      "extra extra"
      / 1fr auto;
  }
}

.word {
  font-size: 2em;
  grid-area: word;
  margin: 0;
  max-inline-size: 75vw;
}

.word-link {
  color: inherit;
  text-decoration: none;
}

.meaning {
  grid-area: meaning;
}

.actions {
  grid-area: actions;
}

.extra {
  grid-area: extra;
}

.additional-meanings-details summary {
  color: var(--text-light);
  cursor: pointer;
  inline-size: max-content;
}

.additional-meanings {
  list-style: none;
  padding-inline: 1ex;
  margin-inline: 1ex;
}

.additional-meaning-item:not(:first-child) {
  margin-block-start: 1ex;
}
</style>
