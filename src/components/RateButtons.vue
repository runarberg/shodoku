<script setup lang="ts">
import { Card as FSRSCard, Rating, RecordLogItem } from "ts-fsrs";
import { computed } from "vue";

import { useFsrs } from "../helpers/fsrs.ts";
import { formatRelativeTime } from "../helpers/time.ts";
import AppButton from "./AppButton.vue";

const props = defineProps<{
  progress: FSRSCard;
}>();

const emit = defineEmits<{
  rate: [next: RecordLogItem];
}>();

const fsrs = useFsrs();
const ratings = computed(() => fsrs.value.repeat(props.progress, new Date()));

function nextReview(next: FSRSCard): string {
  const currentReviewTime = next.last_review?.getTime() ?? Date.now();
  const nextReviewTime = next.due.getTime();

  return formatRelativeTime(nextReviewTime - currentReviewTime);
}

function rateCard(rating: Rating) {
  if (rating === Rating.Manual) {
    // Not implemented
    return;
  }

  emit("rate", fsrs.value.next(props.progress, new Date(), rating));
}
</script>

<template>
  <div class="rate-buttons">
    <AppButton
      v-for="{ log, card: next } of ratings"
      :key="log.rating"
      class="rating-button"
      :data-rating="Rating[log.rating]"
      @click="rateCard(log.rating)"
    >
      <span class="rate-button-content">
        <span class="rating">{{ Rating[log.rating] }}</span>
        <small class="next-review-time">{{ nextReview(next) }}</small>
      </span>
    </AppButton>
  </div>
</template>

<style scoped>
.rate-buttons {
  column-gap: 1ex;
  display: flex;
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

  & .rate-button-content {
    align-items: center;
    column-gap: 0.5ex;
    display: flex;

    @media screen and (max-width: 60ch) {
      flex-direction: column;
    }
  }

  & .next-review-time {
    font-weight: normal;
    font-size: 0.7em;
  }
}
</style>
