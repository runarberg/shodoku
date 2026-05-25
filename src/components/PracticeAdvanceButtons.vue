<script lang="ts" setup>
import AppButton from "../components/AppButton.vue";
import { type CardType } from "../types.ts";

const showAnswer = defineModel<boolean>("show-answer", { default: false });

defineProps<{
  cardType: CardType;
}>();

defineEmits<{
  advance: [];
}>();
</script>

<template>
  <div class="practice-advance-buttons">
    <AppButton v-if="showAnswer" filled @click="$emit('advance')">
      Next
    </AppButton>

    <AppButton v-else filled @click="showAnswer = true">
      Show
      <template v-if="cardType.endsWith('-read')"> Reading </template>
      <template v-else> Writing </template>
    </AppButton>
  </div>
</template>

<style scoped>
.practice-advance-buttons {
  backdrop-filter: blur(2em);
  display: flex;
  column-gap: 1ex;
  inline-size: max-content;
  inset-block-start: 0;
  padding-block: 1em 1ex;
  padding-inline-end: 1em;
  position: sticky;
}
</style>
