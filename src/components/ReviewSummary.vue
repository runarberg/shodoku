<script setup lang="ts">
import { db } from "../db/index.ts";
import { useLiveQuery } from "../helpers/db.ts";
import { midnight } from "../helpers/time.ts";
import { increaseReviewLimit } from "../store/reviews.ts";
import { CardReview } from "../types.ts";

import AppButton from "./AppButton.vue";
import ReviewSummaryItem from "./ReviewSummaryItem.vue";

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
</script>

<template>
  <section class="review-summary">
    <ul v-if="reviewedCards" class="review-summary-list">
      <li v-for="[cardId, reviews] of reviewedCards">
        <ReviewSummaryItem :card-id="cardId" :reviews="reviews" />
      </li>
    </ul>

    <AppButton @click="increaseReviewLimit()">Continue Review</AppButton>
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
</style>
