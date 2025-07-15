<script setup lang="ts">
import { useId } from "vue";

import AppFormField from "./AppFormField.vue";

const model = defineModel<string>();

defineProps<{
  label?: string;
  inline?: boolean;
}>();

const id = useId();
</script>

<template>
  <AppFormField :control="id" :label="label" :inline="inline">
    <template v-if="$slots.label" #label><slot name="label" /></template>
    <template v-if="$slots.info" #info><slot name="info" /></template>

    <input :id="id" v-model="model" v-bind="$attrs" class="input" />
  </AppFormField>
</template>

<style scoped>
.input {
  font-family: inherit;
  font-size: 0.9em;
}
</style>
