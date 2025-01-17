<script setup lang="ts">
import { computed, ref, watch } from "vue";

import { useWordFurigana } from "../helpers/words.ts";
import { wordRoute } from "../router.ts";
import { Furigana, Word } from "../types.ts";

import VocabularyWordMeaning from "./VocabularyWordMeaning.vue";
import VocabularyWordFurigana from "./VocabularyWordFurigana.vue";
import { hasKanjiRE } from "../helpers/text";
import WordWritingSelect from "./WordWritingSelect.vue";

const props = withDefaults(
  defineProps<{
    word: Word;
    kanji?: string | null;
    hideKanji?: boolean;
    hideReading?: boolean;
    hideMeaning?: boolean;
  }>(),
  {
    kanji: null,
    hideKanji: false,
    hideReading: false,
    hideMeaning: false,
  }
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
});

const meaning = computed(() => meanings.value.at(0));
const selectedFurigana = ref<Furigana | string | null>(null);

const additionalMeanings = computed(() => meanings.value.slice(1));

watch(
  () => props.word.id,
  (newId, oldId) => {
    if (newId !== oldId) {
      selectedFurigana.value = null;
    }
  }
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

    <div class="meaning" v-show="!hideMeaning">
      <VocabularyWordMeaning v-if="meaning" :meaning="meaning" />

      <details
        v-if="additionalMeanings.length > 0"
        class="additional-meanings-details"
      >
        <summary>{{ additionalMeanings.length }} more</summary>

        <ul class="additional-meanings">
          <li
            v-for="additionalMeaning of additionalMeanings"
            class="additional-meaning-item"
          >
            <VocabularyWordMeaning :meaning="additionalMeaning" />
          </li>
        </ul>
      </details>
    </div>

    <div class="actions">
      <WordWritingSelect
        v-if="!hideKanji && !hideReading"
        v-model="selectedFurigana"
        :word="word"
        :default="furigana"
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
    / fit-content(50%) 1fr auto;

  @media screen and (max-width: 60ch) {
    column-gap: 0.5ex;
    grid-template:
      "word actions"
      "meaning meaning"
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
