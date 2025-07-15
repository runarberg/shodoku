<script setup lang="ts">
import AppNumberInput from "../components/AppNumberInput.vue";
import AppCheckbox from "../components/AppCheckbox.vue";
import { dueLimit, fsrsFuzzEnabled, newLimit } from "../store/reviews.ts";
</script>

<template>
  <form class="form-body" @submit.prevent>
    <AppNumberInput v-model="dueLimit" label="Daily review limit" inline />
    <AppNumberInput v-model="newLimit" label="Daily new limit" inline />
    <AppCheckbox v-model="fsrsFuzzEnabled" label="Fuzz review times" />
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
