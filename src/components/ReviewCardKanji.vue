<script setup lang="ts">
import { Card as FSRSCard, RecordLogItem } from "ts-fsrs";

import { useKanji, useKanjiVocab } from "../helpers/kanji.ts";
import { provideKanjiVG } from "../helpers/kanjivg.ts";
import KanjiComponents from "./KanjiComponents.vue";
import KanjiReadings from "./KanjiReadings.vue";
import KanjiStrokes from "./KanjiStrokes.vue";
import KanjiTitle from "./KanjiTitle.vue";
import KanjiWordList from "./KanjiWordList.vue";
import ReviewAdvanceButtons from "./ReviewAdvanceButtons.vue";

const props = defineProps<{
  cardId: number;
  progress: FSRSCard;
  isNew?: boolean;
  isRating?: boolean;
  mode: "read" | "write";
}>();

defineEmits<{
  answer: [];
  rate: [next: RecordLogItem];
}>();

const kanji = useKanji(() => props.cardId);
const kanjiVocab = useKanjiVocab(() => props.cardId);

provideKanjiVG(() => props.cardId.toString(16).padStart(5, "0"));
</script>

<template>
  <section v-if="kanji">
    <KanjiTitle
      class="title"
      :kanji="kanji"
      :hide-literal="!isRating && !isNew && mode === 'write'"
      :hide-meaning="!isRating && mode === 'read'"
    />

    <KanjiReadings
      class="readings"
      :kanji="kanji"
      :hide-readings="mode === 'read' && !isRating"
    />

    <KanjiStrokes
      class="strokes"
      :kanji="kanji.literal"
      :auto-hint="isNew && !isRating && mode === 'write'"
      :practice-mode="!isRating && mode === 'write'"
      @practice-done="$emit('answer')"
    />

    <ReviewAdvanceButtons
      :progress="progress"
      :is-rating="isRating"
      :mode="mode"
      @answer="$emit('answer')"
      @rate="$emit('rate', $event)"
    />

    <KanjiComponents
      class="components"
      :hide="!isRating && !(mode === 'write' && isNew)"
    />

    <KanjiWordList
      v-if="kanjiVocab"
      class="words"
      :kanji-vocab="kanjiVocab"
      :hide-kanji="!isRating && !isNew && mode === 'write'"
      :hide-reading="!isRating && mode === 'read'"
      :hide-meaning="!isRating && mode === 'read'"
    />
  </section>
</template>
