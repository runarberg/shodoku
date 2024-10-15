<script setup lang="ts">
import { RecordLogItem } from "ts-fsrs";

import { useKanji, useKanjiVocab } from "../helpers/kanji.ts";
import { provideKanjiVG } from "../helpers/kanjivg.ts";
import { CardProgress } from "../types.ts";

import AppButton from "./AppButton.vue";
import KanjiComponents from "./KanjiComponents.vue";
import KanjiReadings from "./KanjiReadings.vue";
import KanjiStrokes from "./KanjiStrokes.vue";
import KanjiTitle from "./KanjiTitle.vue";
import KanjiWordList from "./KanjiWordList.vue";
import RateButtons from "./RateButtons.vue";

const props = defineProps<{
  progress: CardProgress;
  answered?: boolean;
}>();

defineEmits<{
  answer: [];
  rate: [card: RecordLogItem];
}>();

const kanji = useKanji(() => props.progress.cardId);
const kanjiVocab = useKanjiVocab(() => props.progress.cardId);
provideKanjiVG(() => props.progress.cardId.toString(16).padStart(5, "0"));
</script>

<template>
  <section v-if="kanji">
    <KanjiTitle
      class="title"
      :kanji="kanji"
      :hide-literal="!answered && progress.cardType === 'kanji-write'"
      :hide-meaning="!answered && progress.cardType === 'kanji-read'"
    />
    <KanjiReadings
      v-if="answered || progress.cardType === 'kanji-write'"
      class="readings"
      :kanji="kanji"
    />
    <KanjiStrokes
      class="strokes"
      :kanji="kanji"
      :practice-mode="!answered && progress.cardType === 'kanji-write'"
    />

    <div class="advance-buttons">
      <RateButtons
        v-if="answered"
        :fsrs="progress.fsrs"
        @rate="$emit('rate', $event)"
      />

      <AppButton v-else @click="$emit('answer')" filled>
        Show
        <template v-if="progress.cardType === 'kanji-read'"> Reading</template>
        <template v-else> Writing</template>
      </AppButton>
    </div>

    <KanjiComponents v-if="answered" class="components" />

    <KanjiWordList
      class="words"
      v-if="kanjiVocab"
      :kanji-vocab="kanjiVocab"
      :hide-kanji="!answered && progress.cardType === 'kanji-write'"
      :hide-reading="!answered && progress.cardType === 'kanji-read'"
      :hide-meaning="!answered && progress.cardType === 'kanji-read'"
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
