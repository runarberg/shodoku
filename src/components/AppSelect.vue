<script setup lang="ts">
import { useId } from "vue";

import AppFormField from "./AppFormField.vue";

const model = defineModel<string>();

defineProps<{
  label?: string;
  inline?: boolean;
  options?: string[];
}>();

const id = useId();
</script>

<template>
  <AppFormField :control="id" :label="label" :inline="inline">
    <template v-if="$slots.label" #label><slot name="label" /></template>
    <template v-if="$slots.info" #info><slot name="info" /></template>

    <select :id="id" v-model="model" v-bind="$attrs" class="select">
      <option v-for="option of options" :key="option">{{ option }}</option>
    </select>
  </AppFormField>
</template>

<style scoped>
.select {
  font-family: inherit;
  font-size: 0.9em;
}
</style>
