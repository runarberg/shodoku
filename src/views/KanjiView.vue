<script setup lang="ts" ̣>
import { computed } from "vue";
import { useRoute } from "vue-router";

import KanjiComponents from "../components/KanjiComponents.vue";
import KanjiReadings from "../components/KanjiReadings.vue";
import KanjiStrokes from "../components/KanjiStrokes.vue";
import KanjiTitle from "../components/KanjiTitle.vue";
import KanjiWordList from "../components/KanjiWordList.vue";
import { useKanji, useKanjiVocab } from "../helpers/kanji.ts";
import { provideKanjiVG } from "../helpers/kanjivg.ts";

const route = useRoute();
const codepoint = computed(() => {
  const value = route.params.kanji;

  if (typeof value !== "string" || [...value].length !== 1) {
    return null;
  }

  return value.codePointAt(0) ?? null;
});

const hex = computed(() => {
  return codepoint.value?.toString(16).padStart(5, "0") ?? null;
});

const kanji = useKanji(codepoint);
const kanjiVocab = useKanjiVocab(codepoint);
provideKanjiVG(hex);
</script>

<template>
  <article v-if="kanji" class="kanji-card">
    <KanjiTitle class="title" :kanji="kanji" />
    <KanjiReadings class="readings" :kanji="kanji" />
    <KanjiStrokes class="strokes" :kanji="kanji" />
    <KanjiComponents class="components" />
    <KanjiWordList v-if="kanjiVocab" class="words" :kanji-vocab="kanjiVocab" />
  </article>
</template>
