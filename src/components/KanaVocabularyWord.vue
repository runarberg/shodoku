<script setup lang="ts">
import { computed } from "vue";

import { wordRoute } from "../router.ts";
import { KanaInfoVocabularyWord } from "../types.ts";

const props = defineProps<{
  word: KanaInfoVocabularyWord;
  hideRomaji?: boolean;
  hideKana?: boolean;
  targetKana?: string;
}>();

const displayedWord = computed(() => {
  if (!props.hideKana || !props.targetKana) {
    return props.word.kana;
  }

  const charCount = [...props.targetKana].length;
  const replaceChar = "◌".repeat(charCount);

  return props.word.kana.replaceAll(props.targetKana, replaceChar);
});

// Use the collator instead of .startsWith to account for case and
// accents.
const collator = new Intl.Collator("en", {
  usage: "search",
  sensitivity: "base",
});

const hideTranslation = computed(() => {
  if (!props.hideRomaji) {
    return false;
  }

  const { en, romaji } = props.word;

  return collator.compare(en.slice(0, romaji.length), romaji) === 0;
});

const route = computed(() =>
  props.word.wordId ? wordRoute(props.word.wordId) : null,
);
</script>

<template>
  <component
    :is="route ? 'RouterLink' : 'div'"
    :to="route"
    class="kana-vocabulary-word"
  >
    <p class="kana" lang="ja">{{ displayedWord }}</p>
    <p v-if="!hideRomaji" class="romaji">{{ word.romaji }}</p>

    <p class="translation" :class="{ blur: hideTranslation }">
      {{ word.en }}
    </p>
  </component>
</template>

<style scoped>
.kana-vocabulary-word {
  color: inherit;
  column-gap: 1ex;
  display: grid;
  grid-template:
    "romaji ."
    "kana   translation"
    / max-content auto;
  text-decoration: none;

  & p {
    margin: 0;
  }
}

.kana {
  font-weight: 600;
  grid-area: kana;
}

.romaji {
  color: var(--text-light);
  font-size: 0.85em;
  grid-area: romaji;
}

.translation {
  align-self: center;
  grid-area: translation;

  &.blur {
    filter: blur(3px);
  }
}
</style>
