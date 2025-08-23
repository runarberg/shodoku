<script lang="ts" setup>
import { ref, useId } from "vue";

import AppButton from "./AppButton.vue";
import AppIcon from "./AppIcon.vue";

withDefaults(
  defineProps<{
    title?: string | null;
    cancelLabel?: string | null;
    confirmDisabled?: boolean;
    confirmLabel?: string | null;
  }>(),
  {
    title: null,
    cancelLabel: null,
    confirmDisabled: false,
    confirmLabel: null,
  },
);

const emit = defineEmits<{
  cancel: [];
  close: [];
  confirm: [];
}>();

const open = ref(false);
const dialog = ref<HTMLDialogElement | null>(null);

const idPrefix = useId();

function close(returnValue = "") {
  emit("close");
  open.value = false;

  if (dialog.value?.open) {
    dialog.value.close(returnValue);
  }
}

function cancel() {
  emit("cancel");
  close("");
}

function confirm() {
  close("confirmed");
  emit("confirm");
}

function show() {
  open.value = true;
  dialog.value?.showModal();
}

defineExpose({
  close,
  show,
});
</script>

<template>
  <Teleport to="[id='app:dialogs']">
    <dialog
      v-bind="$attrs"
      ref="dialog"
      :aria-labelledby="`${idPrefix}/title`"
      class="app-dialog"
      @cancel.prevent="cancel"
    >
      <header class="header">
        <strong :id="`${idPrefix}/title`" class="title">
          <slot name="title">{{ title }}</slot>
        </strong>

        <AppButton
          aria-label="close"
          class="close-button"
          inline
          @click="cancel"
        >
          <AppIcon icon="x-mark" />
        </AppButton>
      </header>

      <div class="body">
        <slot />

        <form
          :id="`${idPrefix}/form`"
          class="form"
          method="dialog"
          @submit.prevent="confirm"
        >
          <slot name="form" />
        </form>
      </div>

      <footer class="footer">
        <slot name="footer" />

        <div class="buttons">
          <slot name="buttons" />
          <AppButton v-if="cancelLabel || $slots.cancel" @click="cancel">
            <slot name="cancel">{{ cancelLabel }}</slot>
          </AppButton>

          <AppButton
            v-if="confirmLabel || $slots.confirm"
            type="submit"
            filled
            :form="`${idPrefix}/form`"
            :disabled="confirmDisabled"
          >
            <slot name="confirm">{{ confirmLabel }}</slot>
          </AppButton>
        </div>
      </footer>
    </dialog>
  </Teleport>
</template>

<style scoped>
.app-dialog {
  background: var(--background-strong);
  border: 2px solid var(--accent-color);
  border-radius: 1ex;
  bottom: auto;
  display: block;
  font-size: 1rem;
  inline-size: 60ch;
  left: 50%;
  max-block-size: 95vh;
  max-inline-size: calc(100vw - 1em);
  overflow: auto;
  padding: 0;
  position: fixed;
  right: auto;
  scrollbar-color: initial;
  scrollbar-width: thin;
  text-align: start;
  top: 33.3%;
  transform: translate(-50%, -33.3%);
}

.app-dialog::backdrop {
  background: black;
  opacity: 0.3;

  @media (prefers-color-scheme: dark) {
    opacity: 0.7;
  }
}

.app-dialog:not([open]) {
  display: none;
}

.header,
.body,
.footer {
  padding-block: 1.5ex;
  padding-inline: 1.5rem;
}

.header {
  align-items: center;
  background: var(--accent-color);
  border-block-end: 2px solid var(--accent-color);
  color: var(--background-strong);
  display: flex;
}

.header .title {
  font-size: 1.2em;
}

.header .close-button {
  align-items: center;
  color: inherit;
  display: flex;
  font-size: 1.2em;
  inline-size: 1em;
  justify-content: space-around;
  margin-inline-start: auto;
}

.footer {
  display: flex;
}

.footer .buttons {
  column-gap: 1em;
  display: flex;
  margin-inline-start: auto;
}
</style>
