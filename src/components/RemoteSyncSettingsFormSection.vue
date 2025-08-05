<script setup lang="ts">
import { computed, ref } from "vue";

import { PLACEHOLDER } from "../helpers/sync.ts";
import AppButton from "./AppButton.vue";
import AppIcon from "./AppIcon.vue";
import AppInput from "./AppInput.vue";
import AppSelect from "./AppSelect.vue";
import AppTextArea from "./AppTextArea.vue";
import RemoteSyncSettingsFormHeadersField from "./RemoteSyncSettingsFormHeadersField.vue";

const method = defineModel<string>("method", { default: "" });
const url = defineModel<string>("url", { default: "" });
const headers = defineModel<[string, string][]>("headers", { default: [] });
const body = defineModel<string>("body");

const HTTP_METHODS = ["GET", "POST", "PATCH", "PUT"];
const hasRequestBody = computed(() =>
  ["POST", "PATCH", "PUT"].includes(method.value),
);

const exampleRequestBody = `{
  "name": "shodoku_sync.json",
  "content", "${PLACEHOLDER}"
}`;

const placeholderCopied = ref(false);
async function copyPlaceholder() {
  placeholderCopied.value = false;

  await navigator.clipboard.writeText(PLACEHOLDER);
  placeholderCopied.value = true;

  setTimeout(() => {
    placeholderCopied.value = false;
  }, 5000);
}
</script>

<template>
  <div class="remote-sync-settings-form-section">
    <AppSelect
      v-model="method"
      :options="HTTP_METHODS"
      label="method"
      class="method-field"
    />

    <AppInput v-model="url" type="url" label="URL" class="url-field" required />

    <RemoteSyncSettingsFormHeadersField
      v-model="headers"
      class="headers-field"
    />

    <AppTextArea
      v-if="hasRequestBody"
      v-model="body"
      label="Body"
      class="body-field"
      :placeholder="exampleRequestBody"
    >
      <template #info>
        Use <code v-text="PLACEHOLDER" />
        <AppButton inline type="button" @click="copyPlaceholder">
          <span class="text">Copy </span>
          <AppIcon :icon="placeholderCopied ? 'checkmark' : 'copy'" />
        </AppButton>
        to interpolate database sync instructions.
      </template>
    </AppTextArea>
  </div>
</template>

<style scoped>
.remote-sync-settings-form-section {
  display: grid;
  gap: 1ex 1em;
  grid-template:
    "method url"
    "headers headers"
    "body body"
    / min-content 1fr;

  & .method-field {
    grid-area: method;
  }

  & .url-field {
    grid-area: url;
  }

  & .headers-field {
    grid-area: headers;
  }

  & .body-field {
    grid-area: body;

    & :deep(textarea) {
      font-family: ui-monospace, monospace;
      min-block-size: 6em;
    }
  }
}
</style>
