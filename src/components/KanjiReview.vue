<script setup lang="ts">
import { Card as FSRSCard, Rating, RecordLogItem } from "ts-fsrs";
import { computed } from "vue";

import { useFsrs } from "../helpers/fsrs.ts";
import { useKanji, useKanjiVocab } from "../helpers/kanji.ts";
import { provideKanjiVG } from "../helpers/kanjivg.ts";
import { formatRelativeTime } from "../helpers/time.ts";
import { Card } from "../types.ts";

import AppButton from "./AppButton.vue";
import KanjiComponents from "./KanjiComponents.vue";
import KanjiReadings from "./KanjiReadings.vue";
import KanjiStrokes from "./KanjiStrokes.vue";
import KanjiTitle from "./KanjiTitle.vue";
import KanjiWordList from "./KanjiWordList.vue";

const props = defineProps<{
  card: Card;
  type: "read" | "write";
  answered?: boolean;
}>();

const emit = defineEmits<{
  answer: [];
  rate: [card: RecordLogItem];
}>();

const kanji = useKanji(() => props.card.id);
const kanjiVocab = useKanjiVocab(() => props.card.id);
provideKanjiVG(() => props.card.id.toString(16).padStart(5, "0"));

const fsrs = useFsrs();
const ratings = computed(() =>
  fsrs.value.repeat(props.card.fsrs[props.type], new Date())
);

function nextReview(next: FSRSCard): string {
  const currentReviewTime = next.last_review?.getTime() ?? Date.now();
  const nextReviewTime = next.due.getTime();

  return formatRelativeTime(nextReviewTime - currentReviewTime);
}

function gradeCard(rating: Rating) {
  if (rating === Rating.Manual) {
    // Not implemented
    return;
  }

  emit(
    "rate",
    fsrs.value.next(props.card.fsrs[props.type], new Date(), rating)
  );
}
</script>

<template>
  <section v-if="kanji">
    <KanjiTitle
      class="title"
      :kanji="kanji"
      :hide-literal="type === 'write' && !answered"
      :hide-meaning="type === 'read' && !answered"
    />
    <KanjiReadings
      v-if="type === 'write' || answered"
      class="readings"
      :kanji="kanji"
    />
    <KanjiStrokes
      class="strokes"
      :kanji="kanji"
      :practice-mode="type === 'write' && !answered"
    />

    <div class="advance-buttons">
      <template v-if="answered">
        <AppButton
          v-for="{ log, card: next } of ratings"
          class="rating-button"
          :key="log.rating"
          :data-rating="Rating[log.rating]"
          @click="gradeCard(log.rating)"
        >
          {{ Rating[log.rating] }}
          <small class="next-review-time">{{ nextReview(next) }}</small>
        </AppButton>
      </template>
      <AppButton v-else @click="$emit('answer')" filled>
        Show
        <template v-if="type === 'read'"> Reading</template>
        <template v-else> Writing</template>
      </AppButton>
    </div>

    <KanjiComponents v-if="answered" class="components" />

    <KanjiWordList
      class="words"
      v-if="kanjiVocab"
      :kanji-vocab="kanjiVocab"
      :hide-kanji="type === 'write' && !answered"
      :hide-reading="type === 'read' && !answered"
      :hide-meaning="type === 'read' && !answered"
    />
  </section>
</template>

<style scoped>
.advance-buttons {
  backdrop-filter: blur(2em);
  column-gap: 1ex;
  display: flex;
  padding-block: 1em 1ex;
  position: sticky;
  inset-block-start: 0;
  padding-inline-end: 1em;
  inline-size: max-content;
}

.rating-button {
  background: var(--background-strong);
  border-color: currentColor;

  &[data-rating="Again"] {
    color: var(--pink);
  }

  &[data-rating="Hard"] {
    color: var(--orange);
  }

  &[data-rating="Good"] {
    color: var(--green);
  }

  &[data-rating="Easy"] {
    color: var(--blue);
  }

  & .next-review-time {
    font-weight: normal;
    font-size: 0.7em;
  }
}
</style>
