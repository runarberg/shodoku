<script setup lang="ts">
defineProps<{
  filled?: boolean;
}>();
</script>

<template>
  <button class="app-button" :class="{ filled }"><slot /></button>
</template>

<style scoped>
.app-button {
  background: var(--background-light);
  color: var(--accent-color);
  cursor: pointer;
  border: 1px solid var(--accent-color);
  border-radius: 0.5ex;
  font-family: inherit;
  font-size: 1em;
  font-weight: 600;
  line-height: 1em;
  padding: 1ex;

  &.filled {
    background: var(--accent-color);
    color: var(--background-light);
  }

  & :slotted(.app-icon) {
    display: block;
  }
}
</style>
