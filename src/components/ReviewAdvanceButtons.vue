<script setup lang="ts">
import { Card as FSRSCard, RecordLogItem } from "ts-fsrs";

import { kanjiRoute } from "../router.ts";
import AppButton from "./AppButton.vue";
import RateButtons from "./RateButtons.vue";

defineProps<{
  progress: FSRSCard;
  isRating?: boolean;
  mode: "read" | "write";
}>();

defineEmits<{
  answer: [];
  rate: [value: RecordLogItem];
}>();
</script>

<template>
  <div class="advance-buttons" :class="{ 'is-rating': isRating }">
    <RateButtons
      v-if="isRating"
      :progress="progress"
      @rate="$emit('rate', $event)"
    />

    <template v-else>
      <AppButton filled @click="$emit('answer')">
        Show
        <template v-if="mode === 'read'"> Reading </template>
        <template v-else> Writing </template>
      </AppButton>

      <AppButton
        v-if="
          'singleton' in $route.query && typeof $route.params.kanji === 'string'
        "
        :to="kanjiRoute($route.params.kanji)"
        replace
      >
        Cancel
      </AppButton>
    </template>
  </div>
</template>

<style scoped>
.advance-buttons {
  backdrop-filter: blur(2em);
  display: flex;
  column-gap: 1ex;
  inset-block-start: 0;
  margin-block: 1ex;
  margin-inline: -1em;
  padding-block: 1ex;
  padding-inline: 1em;
  position: sticky;

  &:not(.is-rating) {
    inline-size: max-content;
  }

  @media screen and (max-width: 90ch) {
    inset-block-start: 4.5em;
  }
}
</style>
