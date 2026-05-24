<script setup lang="ts">
import { ref, useTemplateRef } from "vue";

import {
  applySyncPatches,
  disableSync,
  getPatches,
  syncRemote,
} from "../db/sync.ts";
import { toSyncPatches } from "../helpers/sync.ts";
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

async function downloadPatches() {
  const patches = await getPatches();
  const file = new File([JSON.stringify(patches)], "patches.json", {
    type: "application/json",
  });

  const link = document.createElement("a");
  const href = URL.createObjectURL(file);

  link.href = href;
  link.download = file.name;
  document.body.append(link);

  link.click();

  link.remove();
  URL.revokeObjectURL(href);
}

async function handlePatchFileChange(event: Event) {
  if (!(event.target instanceof HTMLInputElement)) {
    return;
  }

  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  const reader = new FileReader();
  const text = await new Promise<string>((resolve, reject) => {
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("failed to read file"));
      }
    };

    reader.onerror = () => {
      reject(new Error("failed to read file"));
    };

    reader.readAsText(file);
  });

  try {
    const patches = toSyncPatches(JSON.parse(text));
    await applySyncPatches(patches);
  } catch {
    // TODO: handle error.
  }
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

  <div v-if="remoteSyncEnabled || remoteFormEnabled">
    <details class="details">
      <summary class="summary">Manage Patches</summary>

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

      <div class="buttons">
        <AppButton @click="confirmSquashDialog?.show()">
          Squash Patches
        </AppButton>

        <AppButton @click="downloadPatches">Download Patches</AppButton>

        <label>
          <AppButton tag="span" class="label">Apply Patches</AppButton>
          <input
            class="visually-hidden"
            type="file"
            @change="handlePatchFileChange"
          />
        </label>
      </div>
    </details>
  </div>
</template>

<style scoped>
.buttons {
  gap: 1em 1ex;
  display: flex;
  flex-wrap: wrap;
}

.details {
  margin-block: 1ex;
}

.summary {
  color: var(--accent-color);
  cursor: pointer;
  font-weight: 600;
  padding-block: 0.5ex;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  border: 0;
  padding: 0;

  white-space: nowrap;
  clip-path: inset(100%);
  clip: rect(0 0 0 0);
  overflow: hidden;
}
</style>
