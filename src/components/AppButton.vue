<script setup lang="ts">
import { computed } from "vue";
import { RouteLocationRaw } from "vue-router";

import AppIcon from "./AppIcon.vue";

const props = defineProps<{
  to?: RouteLocationRaw;
  filled?: boolean;
  inline?: boolean;
  prefixIcon?: string;
}>();

const tag = computed(() => (props.to ? "RouterLink" : "button"));

// Sometimes button clicks don’t trigger in Safari. Focus the button should force it to listen.
function handleTouchStart(event: TouchEvent) {
  if (
    event.target instanceof HTMLButtonElement ||
    event.target instanceof HTMLAnchorElement
  ) {
    event.target.focus();
  }
}
</script>

<template>
  <component
    :is="tag"
    :to="to"
    class="app-button"
    :class="{ filled, inline }"
    @touchstart="handleTouchStart"
  >
    <AppIcon v-if="prefixIcon" :icon="prefixIcon" class="prefix-icon" />
    <span class="content"><slot /></span>
  </component>
</template>

<style scoped>
.app-button {
  align-items: center;
  background: var(--background-light);
  border: 1px solid var(--accent-color);
  border-radius: 0.5ex;
  color: var(--accent-color);
  column-gap: 1ex;
  cursor: pointer;
  display: inline-flex;
  font-family: inherit;
  font-size: 1em;
  font-weight: 600;
  line-height: 1em;
  padding: 1ex;
  text-decoration: none;
  touch-action: manipulation;

  &.inline {
    background: none;
    border: none;
    padding: 0.2ex;
  }

  &.filled {
    background: var(--accent-color);
    color: var(--background-light);
  }

  & .content,
  & .prefix-icon,
  & :slotted(.app-icon):only-child {
    display: block;
  }

  &:disabled {
    background: var(--background-light);
    border-color: var(--accent-color-light);
    cursor: default;
    color: var(--accent-color-light);

    &.filled {
      background: var(--accent-color-light);
      border-color: var(--accent-color-light);
      color: var(--background-light);
    }
  }
}
</style>
