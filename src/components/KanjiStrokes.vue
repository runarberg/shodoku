<script setup lang="ts">
import { computed } from "vue";

import {
  useKanjiVG,
  useKanjiVGSyncing,
  useKanjiVGViewBox,
} from "../helpers/kanjivg.ts";
import AppLoading from "./AppLoading.vue";
import StrokesFigure from "./StrokesFigure.vue";

defineProps<{
  kanji: string;
  autoHint?: boolean;
  practiceMode?: boolean;
}>();

defineEmits<{
  practiceDone: [];
}>();

const kanjiVG = useKanjiVG();
const viewBox = useKanjiVGViewBox();
const isKanjiVGSyncing = useKanjiVGSyncing();

const strokes = computed<[string[]]>(() => {
  const result: string[] = [];
  for (const path of kanjiVG.value?.querySelectorAll("path") ?? []) {
    const d = path.getAttribute("d");
    if (d) {
      result.push(d);
    }
  }

  return [result];
});
</script>

<template>
  <section>
    <h2>
      Strokes
      <template
        v-if="!practiceMode && !isKanjiVGSyncing && strokes[0].length > 0"
      >
        ({{ strokes[0].length }})
      </template>
    </h2>

    <StrokesFigure
      v-if="strokes && !isKanjiVGSyncing"
      :view-box="viewBox"
      :char-strokes="strokes"
      :practice-mode="practiceMode"
      :auto-hint="autoHint"
      @practice-done="$emit('practiceDone')"
    />
    <div v-else-if="isKanjiVGSyncing" class="loading-container">
      <AppLoading class="loading" />
    </div>
  </section>
</template>

<style scoped>
.loading-container {
  align-items: center;
  border-radius: 1em;
  background: var(--background-light);
  aspect-ratio: 1;
  display: flex;
  inline-size: 100%;
  justify-content: center;
  max-inline-size: 25em;
  min-inline-size: 15em;
}

.loading {
  color: var(--accent-color);
  display: block;
  line-height: 1;
  font-size: 10em;
  opacity: 0.7;
}
</style>
