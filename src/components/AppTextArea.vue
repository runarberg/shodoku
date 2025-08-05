<script setup lang="ts">
import { useId } from "vue";

import AppFormField from "./AppFormField.vue";

const model = defineModel<string>();

defineProps<{
  label?: string;
}>();

const id = useId();
</script>

<template>
  <AppFormField :control="id" :label="label">
    <template v-if="$slots.label" #label>
      <slot name="label" />
    </template>
    <template v-if="$slots.info" #info>
      <slot name="info" />
    </template>

    <textarea :id="id" v-model="model" v-bind="$attrs" class="textarea" />
  </AppFormField>
</template>

<style scoped>
.textarea {
  font-family: inherit;
  font-size: 0.9em;
}
</style>
