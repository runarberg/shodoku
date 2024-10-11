<script setup lang="ts">
import AppButton from "../components/AppButton.vue";
import { reviewRoute } from "../router";
import { useRemainingCount } from "../store/cards";

const count = useRemainingCount();
</script>

<template>
  <article>
    <div v-if="count" class="counts">
      <span class="review-count">
        {{ count.due }}
      </span>
      <span class="new-count">(+ {{ count.new }})</span>
      <span class="learning-count"> {{ count.learning }}</span>
    </div>

    <AppButton :to="reviewRoute">Start</AppButton>
  </article>
</template>
