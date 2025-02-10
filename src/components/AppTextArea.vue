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
    <textarea :id="id" v-model="model" v-bind="$attrs" class="textarea" />
  </AppFormField>
</template>

<style scoped>
.textarea {
  font-family: inherit;
  font-size: 0.9em;
}
</style>
