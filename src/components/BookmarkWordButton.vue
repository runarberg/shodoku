<script setup lang="ts">
import { computed } from "vue";

import { db } from "../db/index.ts";
import { useLiveQuery } from "../helpers/db.ts";

import AppButton from "./AppButton.vue";
import AppIcon from "./AppIcon.vue";
import { liveQueryBroadcaster } from "../helpers/channels";

const props = defineProps<{
  wordId: number;
  reading?: string | null;
}>();

const { result: isBookmarked } = useLiveQuery(
  computed(() => {
    const id = props.wordId;

    return async () => {
      const count = await (await db).count("bookmarked-words", id);

      return count > 0;
    };
  })
);

async function toggleBookmark() {
  if (isBookmarked.value) {
    (await db).delete("bookmarked-words", props.wordId);
  } else {
    (await db).add("bookmarked-words", {
      wordId: props.wordId,
      reading: props.reading,
      bookmarkedAt: new Date(),
    });
  }

  liveQueryBroadcaster.postMessage("word-bookmarked");
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
