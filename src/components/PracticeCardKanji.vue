<script setup lang="ts">
import { useKanji, useKanjiVocab } from "../helpers/kanji.ts";
import { provideKanjiVG } from "../helpers/kanjivg.ts";
import KanjiComponents from "./KanjiComponents.vue";
import KanjiReadings from "./KanjiReadings.vue";
import KanjiStrokes from "./KanjiStrokes.vue";
import KanjiTitle from "./KanjiTitle.vue";
import KanjiWordList from "./KanjiWordList.vue";

const showAnswer = defineModel<boolean>("show-answer", { default: false });

const { cardId, cardType } = defineProps<{
  cardId: number;
  cardType: "kanji-read" | "kanji-write";
}>();

const kanji = useKanji(() => cardId);
const kanjiVocab = useKanjiVocab(() => cardId);

provideKanjiVG(() => cardId.toString(16).padStart(5, "0"));
</script>

<template>
  <section v-if="kanji">
    <KanjiTitle
      class="title"
      :kanji="kanji"
      :hide-literal="!showAnswer && cardType === 'kanji-write'"
      :hide-meaning="!showAnswer && cardType === 'kanji-read'"
    />

    <KanjiReadings
      class="readings"
      :kanji="kanji"
      :hide-readings="cardType === 'kanji-read' && !showAnswer"
    />

    <KanjiStrokes
      class="strokes"
      :kanji="kanji.literal"
      :practice-mode="!showAnswer && cardType === 'kanji-write'"
      @practice-done="showAnswer = true"
    />

    <slot name="buttons" />

    <KanjiComponents class="components" :hide="!showAnswer" />

    <KanjiWordList
      v-if="kanjiVocab"
      class="words"
      :kanji-vocab="kanjiVocab"
      :hide-kanji="!showAnswer && cardType === 'kanji-write'"
      :hide-reading="!showAnswer && cardType === 'kanji-read'"
      :hide-meaning="!showAnswer && cardType === 'kanji-read'"
    />
  </section>
</template>
