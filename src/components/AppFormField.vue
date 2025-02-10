<script setup lang="ts">
defineProps<{
  control?: string;
  label?: string;
  inline?: boolean;
}>();
</script>

<template>
  <div class="app-form-field" :class="{ inline }">
    <label :for="control" class="label">
      <slot name="label">{{ label }}</slot>
    </label>

    <slot />
  </div>
</template>

<style scoped>
.app-form-field {
  display: flex;
  flex-direction: column;
}

.app-form-field.inline {
  align-items: center;
  column-gap: 1ex;
  flex-direction: row;
}

.label {
  font-weight: 500;
}
</style>
