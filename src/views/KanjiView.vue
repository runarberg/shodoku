<script setup lang="ts" ̣>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";

import KanjiComponents from "../components/KanjiComponents.vue";
import KanjiReadings from "../components/KanjiReadings.vue";
import KanjiStrokes from "../components/KanjiStrokes.vue";
import KanjiTitle from "../components/KanjiTitle.vue";
import KanjiWordList from "../components/KanjiWordList.vue";
import { provideKanjiVG } from "../helpers/kanjivg";

const route = useRoute();

const hex = computed(() => {
  const value = route.params.kanji;

  if (typeof value !== "string" || value.length !== 1) {
    return null;
  }

  return value.codePointAt(0)?.toString(16).padStart(5, "0") ?? null;
});

const kanji = ref(null);
const kanjiVocab = ref(null);

provideKanjiVG(hex);

watch(
  hex,
  async (value) => {
    if (!value) {
      kanji.value = null;
      return;
    }

    const response = await fetch(`/data/kanji-v1/${value}.json`);
    const data = await response.json();

    kanji.value = data;
  },
  { immediate: true }
);

watch(
  hex,
  async (hexValue) => {
    const response = await fetch(`/data/kanji-vocab-v1/${hexValue}.json`);
    const data = await response.json();

    kanjiVocab.value = data;
  },
  { immediate: true }
);
</script>

<template>
  <article v-if="kanji" class="kanji-card">
    <KanjiTitle class="title" :kanji="kanji" />
    <KanjiReadings class="readings" :kanji="kanji" />
    <KanjiStrokes class="strokes" :kanji="kanji" />
    <KanjiComponents class="components" />
    <KanjiWordList class="words" v-if="kanjiVocab" :kanji-vocab="kanjiVocab" />
  </article>
</template>
