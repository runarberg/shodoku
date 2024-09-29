<script setup lang="ts">
import { computed } from "vue";

import { Word, WordReading, WordWriting } from "../types";

import VocabularyWordMeaning from "./VocabularyWordMeaning.vue";

const props = defineProps<{
  word: Word;
  kanji?: string;
}>();

const hasKanjiRE = /\p{Script=Han}/u;

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

const writing = computed(() => {
  if (!props.word.writings) {
    return null;
  }

  let selected: WordWriting | null = null;

  for (const writing of props.word.writings) {
    if (!selected) {
      selected = writing;
      continue;
    }

    if (props.kanji && !writing.text.includes(props.kanji)) {
      continue;
    }

    if (
      writing.priority?.freq &&
      writing.priority.freq <
        (selected.priority?.freq ?? Number.POSITIVE_INFINITY)
    ) {
      selected = writing;
    }
  }

  return selected?.text;
});

const reading = computed(() => {
  if (!props.word.readings) {
    return null;
  }

  let selected: WordReading | null = null;

  for (const reading of props.word.readings) {
    if (!selected) {
      selected = reading;
      continue;
    }

    if (
      reading.priority?.freq &&
      reading.priority.freq <
        (selected.priority?.freq ?? Number.POSITIVE_INFINITY)
    ) {
      selected = reading;
    }
  }

  return selected?.text;
});

const furigana = computed(() => {
  if (!reading.value || !writing.value) {
    return props.word.furigana?.at(0)?.furigana ?? null;
  }

  return (
    props.word.furigana?.find(
      (other) =>
        other.writing === writing.value && other.reading === reading.value
    )?.furigana ??
    props.word.furigana?.at(0)?.furigana ??
    null
  );
});

const meaning = computed(() => meanings.value.at(0));
const additionalMeanings = computed(() => meanings.value.slice(1));
</script>

<template>
  <div class="vocabulary-word">
    <p v-if="furigana" class="word" lang="ja">
      <template v-for="{ ruby, rt } of furigana">
        <template v-if="rt">
          <ruby
            >{{ ruby }}<rp>(</rp><rt>{{ rt }}</rt
            ><rp>)</rp></ruby
          >
        </template>
        <template v-else>{{ ruby }}</template>
      </template>
    </p>
    <p v-else class="word" lang="ja">{{ writing }}</p>

    <div class="meaning">
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
  </div>
</template>

<style scoped>
.vocabulary-word {
  column-gap: 1em;
  display: grid;
  grid-template:
    "word meaning"
    / max-content auto;
}

.word {
  font-size: 2em;
  grid-area: word;
  margin: 0;
}

.meaning {
  flex-shrink: 1;
  grid-area: meaning;
}

.additional-meanings-details summary {
  color: gray;
  cursor: pointer;
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
