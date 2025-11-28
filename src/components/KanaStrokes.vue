<script setup lang="ts">
import { asyncComputed } from "@vueuse/core";
import { computed, ref } from "vue";

import { fetchKanjiVG } from "../helpers/kanjivg.ts";
import StrokesFigure from "./StrokesFigure.vue";

const props = defineProps<{
  kana: string;
  autoHint?: boolean;
  practiceMode?: boolean;
}>();

defineEmits<{
  practiceDone: [];
}>();

const isKanjiVGSyncing = ref(true);

const kanjiVGs = asyncComputed(
  () =>
    Promise.all(
      [...props.kana].map((char) => {
        const hex = char.codePointAt(0)?.toString(16).padStart(5, "0");

        if (!hex) {
          return { strokes: null, rect: null };
        }

        return fetchKanjiVG(hex);
      }),
    ),
  [],
  { evaluating: isKanjiVGSyncing },
);

const strokes = computed(() => {
  const result: string[][] = [];

  for (const kanjiVG of kanjiVGs.value) {
    const charStrokes: string[] = [];

    for (const path of kanjiVG.strokes?.querySelectorAll("path") ?? []) {
      const d = path.getAttribute("d");
      if (d) {
        charStrokes.push(d);
      }
    }

    result.push(charStrokes);
  }

  return result;
});

const viewBox = computed(() => {
  const {
    x = 0,
    y = 0,
    width = 109,
    height = 109,
  } = kanjiVGs.value.at(0)?.rect ?? {};

  return `${x},${y},${width},${height}`;
});
</script>

<template>
  <section>
    <h2>Strokes</h2>

    <StrokesFigure
      v-if="strokes && !isKanjiVGSyncing"
      :view-box="viewBox"
      :char-strokes="strokes"
      :practice-mode="practiceMode"
      :auto-hint="autoHint"
      @practice-done="$emit('practiceDone')"
    />
  </section>
</template>
