<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { pipe } from "yta";
import { count, filter, map } from "yta/async";

import AppButton from "../components/AppButton.vue";
import AppLoading from "../components/AppLoading.vue";
import RemoteSyncSyncButton from "../components/RemoteSyncSyncButton.vue";
import { db } from "../db/index.ts";
import { useLiveQuery } from "../helpers/db.ts";
import {
  deckBrowserRoute,
  reviewRoute,
  reviewSummaryRoute,
} from "../router.ts";
import {
  increaseReviewLimit,
  newLimit,
  useRemainingCount,
  useReviewedCards,
} from "../store/reviews.ts";

const router = useRouter();
const remainingCount = useRemainingCount();

const doneToday = computed(() => {
  const counts = remainingCount.value;

  if (!counts) {
    return false;
  }

  return counts.due === 0 && counts.new === 0 && counts.learning === 0;
});

const { result: deckCount } = useLiveQuery(async () =>
  pipe(
    (await db).transaction("decks").store.iterate(),
    map((cursor) => cursor.value),
    filter((deck) => deck.active),
    count()
  )
);

const reviewedCards = useReviewedCards();
const reviewedCardsCount = computed(() => reviewedCards.value?.size ?? 0);

function continueReview() {
  increaseReviewLimit();
  router.push(reviewRoute);
}
</script>

<template>
  <article>
    <div v-if="deckCount === null" class="loading">
      <AppLoading class="loading-icon" />
    </div>

    <template v-else-if="deckCount === 0">
      <p>
        You don’t have any active decks. Click the button below to select a deck
        and start learning new kanji.
      </p>

      <nav class="home-nav">
        <AppButton :to="deckBrowserRoute" filled>Select Decks</AppButton>
      </nav>
    </template>

    <template v-else>
      <p v-if="doneToday">
        Finished all reviews today. Click the buttons below to see summary or
        review extra.
      </p>
      <p v-else-if="remainingCount" class="counts">
        You have
        <span class="due-count">{{ remainingCount.due }} reviews</span> due
        <span class="new-count">(+ {{ remainingCount.new }} new)</span> and
        <span class="learning-count"
          >{{ remainingCount.learning }} learning</span
        >.
      </p>

      <nav class="home-nav">
        <AppButton v-if="!doneToday" :to="reviewRoute" filled>
          Start Review
        </AppButton>

        <RemoteSyncSyncButton conditional />

        <AppButton v-if="reviewedCardsCount > 0" :to="reviewSummaryRoute">
          Today’s Summary
        </AppButton>

        <AppButton v-if="doneToday" @click="continueReview">
          Review {{ newLimit }} Extra
        </AppButton>
      </nav>
    </template>
  </article>
</template>

<style scoped>
.loading {
  text-align: center;

  & .loading-icon {
    color: var(--accent-color);
    font-size: 50cqmin;
    opacity: 0.5;
  }
}

.due-count,
.new-count,
.learning-count {
  font-weight: 600;
}

.due-count {
  color: var(--blue);
}

.new-count {
  color: var(--green);
}

.learning-count {
  color: var(--orange);
}

.home-nav {
  align-items: center;
  column-gap: 1ex;
  display: flex;
}
</style>
