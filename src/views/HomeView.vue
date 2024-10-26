<script setup lang="ts">
import { computed } from "vue";

import AppButton from "../components/AppButton.vue";
import ReviewSummary from "../components/ReviewSummary.vue";
import { db } from "../db/index.ts";
import { useLiveQuery } from "../helpers/db.ts";
import { deckBrowserRoute, reviewRoute } from "../router.ts";
import { useRemainingCount } from "../store/cards.ts";

const remainingCount = useRemainingCount();

const doneToday = computed(() => {
  const counts = remainingCount.value;

  if (!counts) {
    return false;
  }

  return counts.due === 0 && counts.new === 0 && counts.learning === 0;
});

const { result: deckCount } = useLiveQuery(async () =>
  (await db).count("decks")
);
</script>

<template>
  <article>
    <!-- deckCount === null means we are still loading the count -->
    <template v-if="deckCount === 0">
      <p>
        You don’t have any active decks. Click the button below to select a deck
        and start learning new kanji.
      </p>

      <AppButton :to="deckBrowserRoute" filled>Select Decks</AppButton>
    </template>

    <ReviewSummary v-else-if="doneToday" />

    <template v-else>
      <p v-if="remainingCount" class="counts">
        You have
        <span class="due-count">{{ remainingCount.due }} reviews</span> due
        <span class="new-count">(+ {{ remainingCount.new }} new)</span> and
        <span class="learning-count"
          >{{ remainingCount.learning }} learning</span
        >. Click the button below to start review.
      </p>

      <AppButton :to="reviewRoute" filled> Start </AppButton>
    </template>
  </article>
</template>

<style scoped>
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
</style>
