<script setup lang="ts">
import { asyncComputed } from "@vueuse/core";
import { RecordLogItem, State } from "ts-fsrs";
import { computed, ref } from "vue";

import { db } from "../db/index.ts";
import { useKanji, useKanjiVocab } from "../helpers/kanji.ts";
import { provideKanjiVG } from "../helpers/kanjivg.ts";
import { CardProgress, Optional } from "../types.ts";
import AppButton from "./AppButton.vue";
import KanjiComponents from "./KanjiComponents.vue";
import KanjiReadings from "./KanjiReadings.vue";
import KanjiStrokes from "./KanjiStrokes.vue";
import KanjiTitle from "./KanjiTitle.vue";
import KanjiWordList from "./KanjiWordList.vue";
import RateButtons from "./RateButtons.vue";

const props = defineProps<{
  card: Optional<CardProgress, "fsrs">;
  isRating?: boolean;
}>();

const emit = defineEmits<{
  answer: [];
  rate: [value: { progress: CardProgress; next: RecordLogItem }];
}>();

const kanji = useKanji(() => props.card.cardId);
const kanjiVocab = useKanjiVocab(() => props.card.cardId);
const kanjiStrokesEl = ref<InstanceType<typeof KanjiStrokes> | null>(null);

provideKanjiVG(() => props.card.cardId.toString(16).padStart(5, "0"));

const progress = asyncComputed(async () => {
  const { cardId, cardType, fsrs } = props.card;

  if (fsrs) {
    return fsrs;
  }

  const card = await (await db).get("progress", [cardId, cardType]);

  return card?.fsrs;
}, props.card.fsrs);

const isNewCard = computed(() => progress.value?.state === State.New);

function answer() {
  emit("answer");

  if (props.card.cardType === "kanji-write") {
    kanjiStrokesEl.value?.maybeShowAnswer();
  }
}

function handleRate(next: RecordLogItem): void {
  if (!progress.value) {
    return;
  }

  kanjiStrokesEl.value?.clearPracticeStrokes();

  emit("rate", {
    progress: { ...props.card, fsrs: progress.value },
    next,
  });
}
</script>

<template>
  <section v-if="kanji && progress">
    <KanjiTitle
      class="title"
      :kanji="kanji"
      :hide-literal="!isRating && card.cardType === 'kanji-write' && !isNewCard"
      :hide-meaning="!isRating && card.cardType === 'kanji-read'"
    />

    <KanjiReadings
      v-if="isRating || card.cardType === 'kanji-write'"
      class="readings"
      :kanji="kanji"
    />

    <KanjiStrokes
      ref="kanjiStrokesEl"
      class="strokes"
      :kanji="kanji"
      :auto-hint="!isRating && card.cardType === 'kanji-write' && isNewCard"
      :practice-mode="!isRating && card.cardType === 'kanji-write'"
      @practice-done="$emit('answer')"
    />

    <div class="advance-buttons">
      <RateButtons v-if="isRating" :progress="progress" @rate="handleRate" />

      <AppButton v-else filled @click="answer()">
        Show
        <template v-if="card.cardType === 'kanji-read'"> Reading </template>
        <template v-else> Writing </template>
      </AppButton>
    </div>

    <KanjiComponents
      v-if="isRating || (card.cardType === 'kanji-write' && isNewCard)"
      class="components"
    />

    <KanjiWordList
      v-if="kanjiVocab"
      class="words"
      :kanji-vocab="kanjiVocab"
      :hide-kanji="!isRating && card.cardType === 'kanji-write' && !isNewCard"
      :hide-reading="!isRating && card.cardType === 'kanji-read'"
      :hide-meaning="!isRating && card.cardType === 'kanji-read'"
    />
  </section>
</template>

<style scoped>
.advance-buttons {
  backdrop-filter: blur(2em);
  inline-size: max-content;
  inset-block-start: 0;
  padding-block: 1em 1ex;
  padding-inline-end: 1em;
  position: sticky;
}
</style>
