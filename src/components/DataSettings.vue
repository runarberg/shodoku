<script lang="ts" setup>
import { useAsyncState } from "@vueuse/core";
import { computed, useTemplateRef } from "vue";

import { clearAllStores } from "../db/reset.ts";
import { clearCaches } from "../helpers/cache.ts";
import { formatBytes } from "../helpers/formats.ts";
import AppButton from "./AppButton.vue";
import AppDialog from "./AppDialog.vue";

const deleteDBDialog = useTemplateRef("delete-db-dialog");

// Shim the non-standard usage details
interface StorageUsageDetails {
  indexedDB?: number;
  caches?: number;
  serviceWorkerRegistrations?: number;
}

interface StorageEstimate extends globalThis.StorageEstimate {
  usageDetails?: StorageUsageDetails;
}

const { state: storageEstimate, executeImmediate: syncStorageEstimate } =
  useAsyncState(
    () => navigator.storage.estimate() as Promise<StorageEstimate>,
    null,
  );

const usageBytes = computed(() => storageEstimate.value?.usage);
const cacheBytes = computed(() => storageEstimate.value?.usageDetails?.caches);
const dbBytes = computed(() => storageEstimate.value?.usageDetails?.indexedDB);

async function handleClearCachesClick() {
  await clearCaches();
  syncStorageEstimate();
}

async function handleDeleteDBConfirm() {
  await clearAllStores();
}
</script>

<template>
  <div>
    <p v-if="usageBytes">
      This app stores around
      <strong class="bytes-size">{{ formatBytes(usageBytes) }}</strong> of data
      on your device.
    </p>

    <section>
      <h3>
        Offline Cache
        <span v-if="cacheBytes" class="bytes-size">
          ({{ formatBytes(cacheBytes) }})
        </span>
      </h3>
      <p>Offline cache is mostly dictionary data for offline use.</p>
      <AppButton inline @click="handleClearCachesClick">
        Clear Offline Storage
      </AppButton>
    </section>

    <section>
      <h3>
        Progress Data
        <span v-if="dbBytes" class="bytes-size">
          ({{ formatBytes(dbBytes) }})
        </span>
      </h3>

      <p>
        Progress data includes
        <strong>review history</strong>, <strong>decks</strong>,
        <strong>bookmarks</strong> etc.
      </p>

      <p>Click the button below to reset <em>all</em> your progress.</p>

      <AppDialog
        ref="delete-db-dialog"
        title="Delete Progress"
        cancel-label="Cancel"
        confirm-label="Delete Progress"
        @confirm="handleDeleteDBConfirm"
      >
        <p>Are you sure you want to delete all your progress and start over?</p>
        <p>
          <strong>Danger:</strong> All your progress will be lost. This action
          cannot be undone.
        </p>
      </AppDialog>

      <AppButton inline @click="deleteDBDialog?.show()">
        Delete All Progress Data</AppButton
      >
    </section>
  </div>
</template>

<style scoped>
.bytes-size {
  font-weight: 600;
}
</style>
