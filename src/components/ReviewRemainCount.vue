<script setup lang="ts">
import { useRemainingCount } from "../store/reviews.ts";

const remainingCount = useRemainingCount();
</script>

<template>
  <div v-if="remainingCount" class="review-remaining-count">
    <span class="review-count">
      {{ remainingCount.due }}
    </span>
    <span class="new-count">(+ {{ remainingCount.new }})</span>
    <span class="learning-count"> {{ remainingCount.learning }}</span>
  </div>
</template>

<style scoped>
.review-remaining-count {
  column-gap: 0.8ex;
  display: inline-flex;
  font-size: 0.8em;
  font-weight: 600;
}

.review-count {
  color: var(--blue);
}

.new-count {
  color: var(--green);
}

.learning-count {
  color: var(--orange);
}
</style>
