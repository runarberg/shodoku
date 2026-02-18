<script lang="ts" setup>
import { ref, useId, watch } from "vue";

import { provideMenu } from "../helpers/menu.ts";
import AppIcon from "./AppIcon.vue";

const props = withDefaults(
  defineProps<{
    open?: boolean;
    disabled?: boolean;
    toggleIcon?: string | null;
  }>(),
  {
    open: false,
    disabled: false,
    toggleIcon: null,
  },
);

const emit = defineEmits<{
  (event: "update:open", open: boolean): void;
}>();

const toggleButton = ref<HTMLButtonElement | null>(null);
const popoverEl = ref<HTMLElement | null>(null);
const menuEl = ref<HTMLElement | null>(null);

const menu = provideMenu();

const id = useId();
const anchorName = `--${id}`.replace(":", "-anchor-");

function close() {
  menu.open.value = false;
}

function handleFocusout(event: FocusEvent) {
  if (
    event.relatedTarget instanceof Element &&
    !menuEl.value?.contains(event.relatedTarget)
  ) {
    close();
  }
}

function handleToggle(event: ToggleEvent) {
  menu.open.value = event.newState === "open";
}

function handleBeforeToggle(event: ToggleEvent) {
  if (event.newState !== "open") {
    return;
  }

  // Polyfill the anchor positioning
  if (!("anchorName" in document.documentElement.style)) {
    const togglerBox = toggleButton.value?.getBoundingClientRect();
    const style = popoverEl.value?.style;

    if (style && togglerBox) {
      style.insetBlockStart = `${togglerBox.bottom + window.scrollY}px`;
      style.insetInlineEnd = `calc(100% - ${togglerBox.right}px)`;
    }

    // TODO: Apply fallback positions with an intersection observer.
  }
}

watch(menu.open, (open) => {
  if (!open) {
    popoverEl.value?.hidePopover();
  } else {
    popoverEl.value?.showPopover();
  }

  emit("update:open", open);
});

watch(
  () => props.open,
  (open) => {
    if (open !== menu.open.value) {
      menu.open.value = open;
    }
  },
);
</script>

<template>
  <div
    ref="menuEl"
    class="app-menu popover-container"
    @focusout="handleFocusout($event)"
  >
    <button
      ref="toggleButton"
      class="toggle-button"
      :class="{ open: menu.open.value }"
      :aria-label="$slots.toggle ? undefined : 'Options'"
      :popovertarget="id"
      :disabled="disabled"
    >
      <slot name="toggle">
        <AppIcon v-if="toggleIcon" :icon="toggleIcon" class="toggle-icon" />
      </slot>
    </button>

    <div
      :id="id"
      ref="popoverEl"
      class="popover"
      popover
      @beforetoggle="handleBeforeToggle"
      @toggle="handleToggle"
    >
      <menu role="list" class="menu">
        <slot />
      </menu>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.toggle-button {
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  font-size: 1em;
  font-weight: 400;
  margin: 0;
  padding: 0;

  .popover-container:has(:popover-open) & {
    color: var(--accent-color);
  }
}

.popover {
  background: var(--background-strong);
  border: 1px solid var(--accent-color);
  border-radius: 0.5ex;
  inline-size: max-content;
  inset: auto;
  margin: 0;
  max-inline-size: 25ch;
  padding: 0;
  position: absolute;
}

@supports (anchor-name: --app-menu-anchor) {
  .toggle-button {
    anchor-name: v-bind(anchorName);
  }

  .popover {
    position-area: block-end span-inline-start;
    position-anchor: v-bind(anchorName);
    position-try:
      flip-block,
      flip-inline,
      flip-block flip-inline;
  }
}

.menu {
  list-style: none;
  margin: 0;
  padding: 1ex 0;
}

.toggle-icon {
  color: var(--text-light);

  .toggle-button.open & {
    color: var(--accent-color);
  }
}
</style>
