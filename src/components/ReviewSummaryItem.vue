<script setup lang="ts">
import { State } from "ts-fsrs";
import { computed } from "vue";

import { kanaRoute, kanjiRoute } from "../router.ts";
import { CardReview } from "../types.ts";

const props = defineProps<{
  cardId: number;
  reviews: CardReview[];
}>();

const literal = computed(() => String.fromCharCode(props.cardId));
const firstReview = computed(() => props.reviews.at(0));
const isNew = computed(() => {
  if (!firstReview.value) {
    return false;
  }

  return firstReview.value.log.state === State.New;
});

const route = computed(() =>
  firstReview.value?.cardType.startsWith("kana")
    ? kanaRoute(literal.value)
    : kanjiRoute(literal.value),
);
</script>

<template>
  <RouterLink
    :to="route"
    class="review-summary-item"
    :class="{ 'is-new': isNew }"
  >
    <strong class="card-value">{{ literal }}</strong>
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
