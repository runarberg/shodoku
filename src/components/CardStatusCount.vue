<script lang="ts" setup>
import { formatPercent } from "../helpers/formats";

const {
  total = null,
  know = null,
  review = null,
  due = null,
  remaining = null,
} = defineProps<{
  total?: number | null;
  know?: number | null;
  review?: number | null;
  due?: number | null;
  remaining?: number | null;
}>();
</script>

<template>
  <div v-if="total" class="card-status-count">
    <span class="count total-count">{{ total }} cards</span>
    <span v-if="know" class="count know-count">
      {{ formatPercent(know / total) }} know
    </span>
    <span v-if="review" class="count review-count">
      {{ formatPercent(review / total) }} reviewed
    </span>
    <span v-if="due" class="count due-count">
      {{ formatPercent(due / total) }} due
    </span>
    <span v-if="remaining" class="count new-count">
      {{ formatPercent(remaining / total) }} remaining
    </span>
  </div>
</template>

<style scoped>
.card-status-count {
  column-gap: 1ex;
  display: flex;
}

.count {
  font-weight: 500;

  &.know-count {
    color: var(--green);
  }

  &.review-count {
    color: var(--blue);
  }

  &.due-count {
    color: var(--orange);
  }

  &.new-count {
    color: var(--medium-gray);
  }
}
</style>
