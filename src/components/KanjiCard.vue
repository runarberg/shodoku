<script setup lang="ts">
import { computed, ref, watch } from "vue";

import { KanjiInfo } from "../types";

const props = defineProps<{
  kanji: KanjiInfo;
}>();

const hex = computed(() => props.kanji.codepoint.toString(16).padStart(5, "0"));

watch(
  hex,
  async (hexValue) => {
    const response = await fetch(`/data/kanji-vocab-v1/${hexValue}.json`);
    const data = await response.json();

    kanjiVocab.value = data;
  },
  { immediate: true }
);

provideKanjiVG(hex);
</script>

<template></template>

<style scoped></style>
