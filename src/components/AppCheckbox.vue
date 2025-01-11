<script setup lang="ts">
import { useId } from "vue";

const model = defineModel<boolean>();

defineProps<{
  label?: string;
}>();

defineOptions({
  inheritAttrs: false,
});

const id = useId();
</script>

<template>
  <div class="app-checkbox" :class="[$attrs.class, $style.field]">
    <input
      :id="id"
      v-model="model"
      v-bind="{ ...$attrs, class: undefined }"
      :class="$style.input"
      class="input"
      type="checkbox"
    />

    <label :for="id" :class="$style.label">
      <slot name="label">{{ label }}</slot>
    </label>
  </div>
</template>

<style module>
.field {
  align-items: center;
  column-gap: 1ex;
  display: flex;
}

.label {
  font-weight: 500;
}

.input {
  align-items: center;
  appearance: none;
  background: var(--background-light);
  block-size: 1.2em;
  border: 2px solid var(--accent-color);
  border-radius: 3px;
  display: flex;
  inline-size: 1.2em;
  justify-content: center;
  margin: 0;
}

.input:active {
  border-color: var(--accent-color);
}

.input:checked,
.input:indeterminate {
  background: var(--accent-color);
  border-color: var(--accent-color);
}

.input:disabled {
  background: var(--light-gray);
  border-color: var(--medium-gray);
}

.input:disabled:checked,
.input:disabled:disabled {
  background: var(--medium-gray);
}

.input:checked::after,
.input:indeterminate::after {
  content: "";
}

.input:indeterminate::after {
  background: var(--background-light);
  block-size: 2px;
  inline-size: 0.75em;
}

.input:checked::after {
  --border: 2px solid var(--background-light);
  block-size: 1em;

  border-block-end: var(--border);
  border-inline-end: var(--border);
  box-sizing: border-box;
  font-size: 0.85em;
  inline-size: 0.5em;
  transform: translateY(-1.4142px) rotate(45deg);
  transform-origin: center;
}
</style>
