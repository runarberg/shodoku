<script setup lang="ts">
import { useId } from "vue";

const model = defineModel<number>();

defineProps<{
  label?: string;
}>();

const id = useId();
</script>

<template>
  <div class="app-number-input">
    <label :for="id" class="label">
      <slot name="label">{{ label }}</slot>
    </label>

    <input :id="id" v-model.number="model" type="number" class="input" />
  </div>
</template>

<style scoped>
.app-number-input {
  align-items: center;
  display: flex;
  column-gap: 1ex;
}

.input {
  font-family: inherit;
  font-size: 0.9em;
  inline-size: 5em;
}

.label {
  font-weight: 500;
}
</style>
