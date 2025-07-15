<script setup lang="ts">
import { ref } from 'vue';

import { syncRemote } from "../db/sync.ts";
import { useHasUnsyncedStores, useRemoteSyncEnabled } from "../store/sync.ts";

import AppButton from './AppButton.vue';

defineProps<{
  conditional?: boolean;
  filled?: boolean;
}>();

const emit = defineEmits<{
  syncing: [];
  success: [];
}>()

const syncing = ref(false);
const { result: remoteSyncEnabled } = useRemoteSyncEnabled();
const { result: hasUnsyncedStores } = useHasUnsyncedStores();

async function sync() {
  emit("syncing")
  syncing.value = true;

  try {
    await syncRemote();
    emit("success")
  } finally {
    syncing.value = false;
  }
}

defineExpose({
  sync,
});
</script>

<template>
  <AppButton
    v-if="!conditional || remoteSyncEnabled"
    type="submit"
    prefix-icon="refresh"
    :filled="filled || (hasUnsyncedStores === true)"
    :disabled="syncing"
    @click="sync"
  >
    <template v-if="syncing">Syncing</template>
    <template v-else>Sync</template>
  </AppButton>
</template>
