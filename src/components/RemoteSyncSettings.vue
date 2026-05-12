<script setup lang="ts">
import { ref, useTemplateRef } from "vue";

import { disableSync, syncRemote } from "../db/sync.ts";
import { useRemoteSyncEnabled } from "../store/sync.ts";
import AppButton from "./AppButton.vue";
import AppDialog from "./AppDialog.vue";
import AppLoading from "./AppLoading.vue";
import RemoteSyncSettingsForm from "./RemoteSyncSettingsForm.vue";
import RemoteSyncSyncButton from "./RemoteSyncSyncButton.vue";

const confirmSquashDialog = useTemplateRef("confirm-squash-dialog");
const remoteFormEnabled = ref(false);

const { loading, result: remoteSyncEnabled } = useRemoteSyncEnabled();

function enableRemoteSync() {
  remoteFormEnabled.value = true;
}

function squashRemotePatches() {
  syncRemote({ squash: true });
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

      <AppDialog
        ref="confirm-squash-dialog"
        title="Squash Remote Patches"
        cancel-label="Cancel"
        confirm-label="Squash"
        @confirm="squashRemotePatches"
      >
        <p>
          <strong>Warning</strong> This will squash all remote patches into a
          single patch, other clients may not be able sync after this.
        </p>
        <p>Any unpulled changes <strong>will be lost</strong> after this.</p>
      </AppDialog>

      <AppButton inline @click="confirmSquashDialog?.show()">
        Squash Patches
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
