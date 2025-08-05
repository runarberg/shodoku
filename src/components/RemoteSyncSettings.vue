<script setup lang="ts">
import { ref } from "vue";

import { disableSync } from "../db/sync.ts";
import { useRemoteSyncEnabled } from "../store/sync.ts";
import AppButton from "./AppButton.vue";
import AppLoading from "./AppLoading.vue";
import RemoteSyncSettingsForm from "./RemoteSyncSettingsForm.vue";
import RemoteSyncSyncButton from "./RemoteSyncSyncButton.vue";

const remoteFormEnabled = ref(false);

const { loading, result: remoteSyncEnabled } = useRemoteSyncEnabled();

function enableRemoteSync() {
  remoteFormEnabled.value = true;
}
</script>

<template>
  <AppLoading v-if="loading" />

  <RemoteSyncSettingsForm
    v-else-if="remoteFormEnabled"
    @cancel="remoteFormEnabled = false"
    @success="remoteFormEnabled = false"
  />

  <div v-else class="buttons">
    <template v-if="remoteSyncEnabled">
      <RemoteSyncSyncButton filled />

      <AppButton prefix-icon="edit" @click="remoteFormEnabled = true">
        Configure Remote
      </AppButton>

      <AppButton inline prefix-icon="delete" @click="disableSync">
        Disable Remote Sync
      </AppButton>
    </template>

    <AppButton v-else filled @click="enableRemoteSync">
      Enable Remote Sync
    </AppButton>
  </div>
</template>

<style scoped>
.buttons {
  gap: 1em 1ex;
  display: flex;
  flex-wrap: wrap;
}
</style>
