<script setup lang="ts">
import { reactive, ref } from "vue";

import {
  remoteSyncFetchHeaders,
  remoteSyncFetchMethod,
  remoteSyncFetchURL,
  remoteSyncPushBody,
  remoteSyncPushHeaders,
  remoteSyncPushMethod,
  remoteSyncPushURL,
} from "../store/sync.ts";
import AppButton from "./AppButton.vue";
import RemoteSyncSettingsFormSection from "./RemoteSyncSettingsFormSection.vue";
import RemoteSyncSyncButton from "./RemoteSyncSyncButton.vue";

const emit = defineEmits<{
  cancel: [];
  success: [];
}>();

const model = reactive({
  fetch: {
    headers: remoteSyncFetchHeaders.value,
    method: remoteSyncFetchMethod.value,
    url: remoteSyncFetchURL.value,
  },
  push: {
    body: remoteSyncPushBody.value,
    headers: remoteSyncPushHeaders.value,
    method: remoteSyncPushMethod.value,
    url: remoteSyncPushURL.value,
  },
});

const syncButton = ref<InstanceType<typeof RemoteSyncSyncButton> | null>(null);

function saveValues() {
  remoteSyncFetchHeaders.value = model.fetch.headers;
  remoteSyncFetchMethod.value = model.fetch.method;
  remoteSyncFetchURL.value = model.fetch.url;
  remoteSyncPushBody.value = model.push.body;
  remoteSyncPushHeaders.value = model.push.headers;
  remoteSyncPushMethod.value = model.push.method;
  remoteSyncPushURL.value = model.push.url;
}

async function submit() {
  await syncButton.value?.sync();
  emit("success");
}

function resetValues() {
  model.fetch.headers = remoteSyncFetchHeaders.value;
  model.fetch.method = remoteSyncFetchMethod.value;
  model.fetch.url = remoteSyncFetchURL.value;
  model.push.body = remoteSyncPushBody.value;
  model.push.headers = remoteSyncPushHeaders.value;
  model.push.method = remoteSyncPushMethod.value;
  model.push.url = remoteSyncPushURL.value;
}
</script>

<template>
  <form @submit.prevent="submit" @reset.prevent="resetValues">
    <p>
      Set the below values to a remote which serves your sync document. This
      remote can be a GitHub gist, a google drive file, or your own server. The
      only requirement is that you have to be able to upload and retrieve a text
      document.
    </p>

    <section class="remote-sync-form-section">
      <h3>Fetch</h3>

      <RemoteSyncSettingsFormSection
        v-model:method="model.fetch.method"
        v-model:url="model.fetch.url"
        v-model:headers="model.fetch.headers"
      />
    </section>

    <section class="remote-sync-form-section">
      <h3>Push</h3>

      <RemoteSyncSettingsFormSection
        v-model:method="model.push.method"
        v-model:url="model.push.url"
        v-model:headers="model.push.headers"
        v-model:body="model.push.body"
      />
    </section>

    <div class="form-buttons">
      <AppButton type="reset" @click="$emit('cancel')"> Cancel </AppButton>
      <RemoteSyncSyncButton
        ref="syncButton"
        filled
        @syncing="saveValues"
        @success="$emit('success')"
      />
    </div>
  </form>
</template>

<style scoped>
.form-buttons {
  column-gap: 1ex;
  display: flex;
  justify-content: end;
  margin-block-start: 1em;
}
</style>
