<script setup lang="ts">
import { computed, watchEffect } from "vue";
import { useRouter } from "vue-router";
import { State } from "ts-fsrs";

import { homeRoute, reviewRoute } from "../router";
import {
  increaseReviewLimit,
  newLimit,
  useRemainingCount,
  useReviewedCards,
} from "../store/reviews.ts";

import AppButton from "./AppButton.vue";
import ReviewSummaryItem from "./ReviewSummaryItem.vue";
import RemoteSyncSyncButton from "./RemoteSyncSyncButton.vue";

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

watchEffect(() => {
  if (reviewedCards.value?.size === 0) {
    // Not reviewed any cards today.
    router.replace(homeRoute);
  }
});
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

    <p v-if="doneToday">
      Click the button below to temporarily increase your daily review limit.
    </p>

    <div class="buttons">
      <AppButton v-if="doneToday" @click="continueReview()">
        Review {{ newLimit }} Extra
      </AppButton>

      <RemoteSyncSyncButton conditional />
    </div>
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

.buttons {
  column-gap: 1ex;
  display: flex;
}
</style>
