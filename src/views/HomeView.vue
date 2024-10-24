<script setup lang="ts">
import { computed } from "vue";

import AppButton from "../components/AppButton.vue";
import ReviewSummary from "../components/ReviewSummary.vue";
import { reviewRoute } from "../router.ts";
import { useRemainingCount } from "../store/cards.ts";

const remainingCount = useRemainingCount();

const doneToday = computed(() => {
  const counts = remainingCount.value;

  if (!counts) {
    return false;
  }

  return counts.due === 0 && counts.new === 0 && counts.learning === 0;
});
</script>

<template>
  <article>
    <ReviewSummary v-if="doneToday" />
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
