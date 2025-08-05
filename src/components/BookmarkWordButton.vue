<script setup lang="ts">
import { computed } from "vue";

import { db as openingDb } from "../db/index.ts";
import { addToSyncStaging } from "../db/sync.ts";
import { liveQueryBroadcaster } from "../helpers/channels.ts";
import { useLiveQuery } from "../helpers/db.ts";
import AppButton from "./AppButton.vue";
import AppIcon from "./AppIcon.vue";

const props = defineProps<{
  wordId: number;
  reading?: string | null;
}>();

const { result: isBookmarked } = useLiveQuery(
  computed(() => {
    const id = props.wordId;

    return async () => {
      const db = await openingDb;
      const count = await db.count("bookmarked-words", id);

      return count > 0;
    };
  }),
);

async function toggleBookmark() {
  const db = await openingDb;

  if (isBookmarked.value) {
    await db.delete("bookmarked-words", props.wordId);
    liveQueryBroadcaster.postMessage("word-unbookmarked");
    addToSyncStaging([
      {
        store: "bookmarked-words",
        op: "delete",
        key: props.wordId,
      },
    ]);

    return;
  }

  const bookmark = {
    wordId: props.wordId,
    reading: props.reading,
    bookmarkedAt: new Date(),
  };

  await db.add("bookmarked-words", bookmark);
  liveQueryBroadcaster.postMessage("word-bookmarked");
  addToSyncStaging([
    {
      store: "bookmarked-words",
      op: "add",
      key: props.wordId,
    },
  ]);
}
</script>

<template>
  <AppButton
    :aria-pressed="isBookmarked"
    class="bookmark-button"
    @click="toggleBookmark()"
  >
    <AppIcon :icon="isBookmarked ? 'star-filled' : 'star'" />
  </AppButton>
</template>

<style scoped>
.bookmark-button {
  background: none;
  border: none;
  padding: 0.2ex;
  font-size: 1.5em;
}
</style>
