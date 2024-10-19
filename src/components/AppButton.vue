<script setup lang="ts">
import { computed } from "vue";
import { RouteLocationRaw } from "vue-router";

import AppIcon from "./AppIcon.vue";

const props = defineProps<{
  to?: RouteLocationRaw;
  filled?: boolean;
  prefixIcon?: string;
}>();

const tag = computed(() => (props.to ? "RouterLink" : "button"));
</script>

<template>
  <component :is="tag" :to="to" class="app-button" :class="{ filled }">
    <AppIcon v-if="prefixIcon" :icon="prefixIcon" class="prefix-icon" />
    <span class="content"><slot /></span>
  </component>
</template>

<style scoped>
.app-button {
  align-items: center;
  background: var(--background-light);
  color: var(--accent-color);
  column-gap: 1ex;
  cursor: pointer;
  border: 1px solid var(--accent-color);
  border-radius: 0.5ex;
  display: inline-flex;
  font-family: inherit;
  font-size: 1em;
  font-weight: 600;
  line-height: 1em;
  padding: 1ex;
  text-decoration: none;

  &.filled {
    background: var(--accent-color);
    color: var(--background-light);
  }

  & .content,
  & .prefix-icon,
  & :slotted(.app-icon) {
    display: block;
  }

  &:disabled {
    cursor: default;
  }
}
</style>
