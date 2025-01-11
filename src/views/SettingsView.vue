<script setup lang="ts">
import AppNumberInput from "../components/AppNumberInput.vue";
import AppCheckbox from "../components/AppCheckbox.vue";
import { dueLimit, fsrsFuzzEnabled, newLimit } from "../store/reviews.ts";
</script>

<template>
  <article class="settings-view">
    <div class="form-body">
      <AppNumberInput v-model="dueLimit" label="Daily review limit" />
      <AppNumberInput v-model="newLimit" label="Daily new limit" />
      <AppCheckbox v-model="fsrsFuzzEnabled" label="Fuzz review times" />
    </div>
  </article>
</template>

<style scoped>
.form-body {
  display: flex;
  flex-direction: column;
  row-gap: 1ex;
}
</style>
