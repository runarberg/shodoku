<script setup lang="ts">
import {
  dueLimit,
  fsrsFuzzEnabled,
  knownMinDueWeeks,
  knownMinRetention,
  newLimit,
} from "../store/reviews.ts";
import AppCheckbox from "./AppCheckbox.vue";
import AppNumberInput from "./AppNumberInput.vue";
</script>

<template>
  <form class="form-body" @submit.prevent>
    <AppNumberInput v-model="dueLimit" label="Daily review limit" inline />
    <AppNumberInput v-model="newLimit" label="Daily new limit" inline />
    <AppCheckbox v-model="fsrsFuzzEnabled" label="Fuzz review times" />
    <fieldset>
      <legend>Consider Kanji <em>known</em> when…</legend>

      <AppNumberInput
        v-model="knownMinRetention"
        label="Retention above (%)"
        min="50"
        max="100"
        inline
      />

      <span class="and">and</span>

      <AppNumberInput
        v-model="knownMinDueWeeks"
        label="Not due within (weeks)"
        min="0"
        max="52"
        inline
      />
    </fieldset>
  </form>
</template>

<style scoped>
.form-body {
  display: flex;
  flex-direction: column;
  row-gap: 1ex;

  & :deep(input[type="number"]) {
    inline-size: 6ch;
  }
}
</style>
