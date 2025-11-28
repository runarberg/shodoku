<script setup lang="ts">
import { Card as FSRSCard, RecordLogItem } from "ts-fsrs";
import { computed } from "vue";

import { randomYoon, useKanaInfo } from "../helpers/kana";
import KanaExamples from "./KanaExamples.vue";
import KanaStrokes from "./KanaStrokes.vue";
import KanaTitle from "./KanaTitle.vue";
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

function isYoon(codePoint: number) {
  return [0x3083, 0x3085, 0x3087, 0x30e3, 0x30e5, 0x30e7].includes(codePoint);
}

const kana = computed(() => {
  const { cardId } = props;

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
      :hide-kana="!isRating && !isNew && mode === 'write'"
      :hide-romaji="!isRating && mode === 'read'"
      actions="review"
      class="title"
    />

    <KanaStrokes
      class="strokes"
      :kana="kana"
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

    <KanaExamples
      v-if="kanaInfo?.vocab"
      :vocab="kanaInfo.vocab"
      :hide-romaji="!isRating && mode === 'read'"
      :hide-kana="!isRating && !isNew && mode === 'write'"
      :target-kana="kana"
    />
  </section>
</template>
