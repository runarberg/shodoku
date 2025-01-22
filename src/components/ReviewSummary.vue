<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import {
  increaseReviewLimit,
  useRemainingCount,
  useReviewedCards,
} from "../store/reviews.ts";

import AppButton from "./AppButton.vue";
import ReviewSummaryItem from "./ReviewSummaryItem.vue";
import { reviewRoute } from "../router";
import { State } from "ts-fsrs";

const router = useRouter();
const reviewedCards = useReviewedCards();

const newCount = computed(() => {
  if (!reviewedCards.value) {
    return 0;
  }

  let sum = 0;
  for (const [review] of reviewedCards.value.values()) {
    if (review.log.state === State.New) {
      sum += 1;
    }
  }

  return sum;
});

const remainingCount = useRemainingCount();
const doneToday = computed(() => {
  const counts = remainingCount.value;

  if (!counts) {
    return false;
  }

  return counts.due === 0 && counts.new === 0 && counts.learning === 0;
});

function continueReview() {
  increaseReviewLimit();
  router.push(reviewRoute);
}
</script>

<template>
  <section class="review-summary">
    <p v-if="reviewedCards">
      Reviewed
      <span class="review-count total-count"
        >{{ reviewedCards.size }} cards</span
      >
      today<template v-if="newCount > 0">
        (of which
        <span class="review-count new-count">{{ newCount }} new</span
        >)</template
      >.
    </p>

    <ul v-if="reviewedCards" class="review-summary-list">
      <li v-for="[cardId, reviews] of reviewedCards">
        <ReviewSummaryItem :card-id="cardId" :reviews="reviews" />
      </li>
    </ul>

    <template v-if="doneToday">
      <p>
        Click the button below to temporarily increase your daily review limit.
      </p>
      <AppButton @click="continueReview()">Continue Review</AppButton>
    </template>
  </section>
</template>

<style scoped>
.review-summary-list {
  gap: 1em;
  list-style: none;
  display: flex;
  padding: 0;
  flex-wrap: wrap;
}

.review-count {
  font-weight: 500;

  &.total-count {
    color: var(--blue);
  }

  &.new-count {
    color: var(--green);
  }
}
</style>
