<script lang="ts" setup="setup">
import type { RouteLocationRaw } from "vue-router";

import { useMenu } from "../helpers/menu.ts";
import AppButton from "./AppButton.vue";

const props = withDefaults(
  defineProps<{
    prefixIcon?: string | null;
    to?: RouteLocationRaw | null;
    disabled?: boolean;
    persistent?: boolean;
    replace?: boolean;
  }>(),
  {
    prefixIcon: null,
    to: null,
    disabled: false,
    persistent: false,
    replace: false,
  },
);

const emit = defineEmits<{
  (event: "click", value: MouseEvent): void;
}>();

const { open } = useMenu();

function handleClick(event: MouseEvent) {
  if (props.disabled) {
    return;
  }

  if (!props.persistent) {
    open.value = false;
  }

  emit("click", event);
}
</script>

<template>
  <li class="app-menu-item">
    <AppButton
      type="button"
      inline
      class="button"
      :disabled="disabled"
      :prefix-icon="prefixIcon"
      :to="to"
      :replace="replace"
      @click="handleClick"
    >
      <template v-if="$slots.prefix" #prefix>
        <slot name="prefix" />
      </template>

      <span class="text"><slot /></span>
    </AppButton>
  </li>
</template>

<style scoped>
.app-menu-item .button {
  align-items: start;
  box-sizing: border-box;
  display: flex;
  font-weight: 600;
  inline-size: 100%;
  padding: 0.5em 1em;
  text-align: start;
}

.app-menu-item .button:not(:disabled, [data-disabled]) .text {
  color: var(--accent-color);
}
</style>
