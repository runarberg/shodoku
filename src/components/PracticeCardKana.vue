<script setup lang="ts">
import { computed } from "vue";

import { randomYoon, useKanaInfo } from "../helpers/kana";
import KanaExamples from "./KanaExamples.vue";
import KanaStrokes from "./KanaStrokes.vue";
import KanaTitle from "./KanaTitle.vue";

const showAnswer = defineModel<boolean>("show-answer", { default: false });

const { cardId, cardType } = defineProps<{
  cardId: number;
  cardType: "kana-read" | "kana-write";
}>();

function isYoon(codePoint: number) {
  return [0x3083, 0x3085, 0x3087, 0x30e3, 0x30e5, 0x30e7].includes(codePoint);
}

const kana = computed(() => {
  if (isYoon(cardId)) {
    return randomYoon(String.fromCodePoint(cardId));
  }

  return String.fromCodePoint(cardId);
});

const kanaInfo = useKanaInfo(kana);
</script>

<template>
  <section v-if="kanaInfo">
    <KanaTitle
      :kana="kana"
      :kana-info="kanaInfo"
      :hide-kana="!showAnswer"
      :hide-romaji="!showAnswer && cardType === 'kana-read'"
      actions="review"
      class="title"
    />

    <KanaStrokes
      class="strokes"
      :kana="kana"
      :practice-mode="!showAnswer && cardType === 'kana-write'"
      @practice-done="showAnswer = true"
    />

    <slot name="buttons" />

    <KanaExamples
      v-if="kanaInfo.vocab"
      :vocab="kanaInfo.vocab"
      :hide-romaji="!showAnswer && cardType === 'kana-read'"
      :hide-kana="!showAnswer && cardType === 'kana-write'"
      :target-kana="kana"
    />
  </section>
</template>
