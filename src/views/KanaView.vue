<script setup lang="ts" ̣>
import { computed } from "vue";
import { useRoute } from "vue-router";

import KanaExamples from "../components/KanaExamples.vue";
import KanaStrokes from "../components/KanaStrokes.vue";
import KanaTitle from "../components/KanaTitle.vue";
import { useKanaInfo } from "../helpers/kana.ts";
import { provideKanjiVG } from "../helpers/kanjivg.ts";

const route = useRoute();
const kana = computed(() => {
  const value = route.params.kana;

  if (typeof value !== "string") {
    return null;
  }

  return value;
});

const kanaInfo = useKanaInfo(kana);

const hex = computed(() => {
  if (!kana.value) {
    return null;
  }

  return [...kana.value]
    .map((char) => char.codePointAt(0)?.toString(16).padStart(5, "0"))
    .join("+");
});

provideKanjiVG(hex);
</script>

<template>
  <article v-if="kana" class="kana-card">
    <KanaTitle :kana="kana" :kana-info="kanaInfo" />
    <KanaStrokes class="strokes" :kana="kana" />

    <KanaExamples v-if="kanaInfo?.vocab" :vocab="kanaInfo.vocab" />
  </article>
</template>
