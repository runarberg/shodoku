<script setup lang="ts">
import { computed } from "vue";

import { kanjiRoute } from "../router";
import { CardReview } from "../types";
import { State } from "ts-fsrs";

const props = defineProps<{
  cardId: number;
  reviews: CardReview[];
}>();

const kanji = computed(() => String.fromCharCode(props.cardId));
const firstReview = computed(() => props.reviews.at(0));
const isNew = computed(() => {
  if (!firstReview.value) {
    return false;
  }

  return firstReview.value.log.state === State.New;
});
</script>

<template>
  <RouterLink
    :to="kanjiRoute(kanji)"
    class="review-summary-item"
    :class="{ 'is-new': isNew }"
  >
    <strong class="card-value">{{ kanji }}</strong>
  </RouterLink>
</template>

<style scoped>
.review-summary-item {
  background: var(--background-strong);
  border: 1px solid var(--accent-color);
  display: flex;
  padding: 0.2ex 0.5ex;
  text-decoration: none;

  &.is-new {
    border-color: var(--green);
  }
}

.card-value {
  color: var(--accent-color);
  font-size: 1.5em;
  font-weight: 500;

  .is-new & {
    color: var(--green);
  }
}
</style>
