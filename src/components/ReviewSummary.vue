<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { db } from "../db/index.ts";
import { useLiveQuery } from "../helpers/db.ts";
import { midnight } from "../helpers/time.ts";
import { increaseReviewLimit } from "../store/reviews.ts";
import { CardReview } from "../types.ts";

import AppButton from "./AppButton.vue";
import ReviewSummaryItem from "./ReviewSummaryItem.vue";
import { REVIEW_ROUTE_NAME, reviewRoute } from "../router";
import { State } from "ts-fsrs";

const route = useRoute();
const router = useRouter();

const { result: reviewedCards } = useLiveQuery(async () => {
  const cards = new Map<number, CardReview[]>();
  const reviewIndex = (await db).transaction("reviews").store.index("review");

  for await (const cursor of reviewIndex.iterate(
    IDBKeyRange.lowerBound(midnight())
  )) {
    const review = cursor.value as CardReview;

    let reviews = cards.get(review.cardId);
    if (!reviews) {
      reviews = [];
      cards.set(review.cardId, reviews);
    }

    reviews.push(review);
  }

  return cards;
});

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

function continueReview() {
  increaseReviewLimit();

  if (route.name !== REVIEW_ROUTE_NAME) {
    router.push(reviewRoute);
  }
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

    <p>
      Click the button below to temporarily increase your daily review limit.
    </p>
    <AppButton @click="continueReview()">Continue Review</AppButton>
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
