<script lang="ts" setup="setup">
import { getSerwist } from "virtual:serwist";
import { ref } from "vue";

import AppButton from "./AppButton.vue";

const dialog = ref<HTMLDialogElement | null>(null);

const needRefresh = ref(false);

async function registerSW() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  const serwist = await getSerwist();

  if (!serwist) {
    return;
  }

  serwist.addEventListener("controlling", () => {
    window.location.reload();
  });

  serwist.addEventListener("waiting", () => {
    needRefresh.value = true;
  });

  serwist.register();
}

registerSW();

function cancel() {
  needRefresh.value = false;
}

async function submit() {
  const serwist = await getSerwist();
  serwist?.messageSkipWaiting();
}
</script>

<template>
  <dialog ref="dialog" :open="needRefresh" class="dialog">
    <strong lang="ja" class="app-title">書読</strong>

    <form method="dialog" class="form" @submit="submit">
      <p class="description">
        A new version available, click
        <AppButton type="submit" inline>reload</AppButton>
        to update.
      </p>

      <div class="buttons">
        <AppButton type="button" weight="slim" @click="cancel()">
          Cancel
        </AppButton>

        <AppButton type="submit" filled> Reload </AppButton>
      </div>
    </form>
  </dialog>
</template>

<style lang="postcss" scoped>
.dialog[open] {
  --shadow-color: light-dark(oklch(0 0 0 / 0.3), oklch(0 0 0 / 0.7));

  align-items: center;
  border: 3px solid var(--accent-color);
  border-radius: 1ex;
  box-shadow:
    0 0 1.5em 0 var(--shadow-color),
    0 1ex 1ex 0 var(--shadow-color);
  column-gap: 1em;
  display: flex;
  inset-block: auto 0;
  inset-inline: auto 0;
  margin: 1em;
  padding: 1em;
  position: fixed;

  @media screen and (max-width: 60ch) {
    margin: 2px;
    text-align: end;
  }
}

.app-title {
  color: var(--accent-color);
  font-size: 2em;
  font-weight: 600;
  writing-mode: vertical-rl;
}

.form p {
  margin: 0;
}

.buttons {
  column-gap: 1em;
  display: flex;
  justify-content: end;
  margin-block-start: 1em;
}
</style>
