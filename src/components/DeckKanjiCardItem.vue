<script setup lang="ts">
import { Card as FSRSCard, State } from "ts-fsrs";
import { computed } from "vue";

import { db } from "../db/index.ts";
import { useLiveQuery } from "../helpers/db.ts";
import { kanjiRoute } from "../router.ts";

const props = defineProps<{
  codepoint: number;
}>();

const kanji = computed(() => String.fromCodePoint(props.codepoint));

const { result: progress } = useLiveQuery(async () => {
  const { codepoint } = props;
  const progressStore = (await db).transaction("progress").store;

  const read = await progressStore.get([codepoint, "kanji-read"]);
  const write = await progressStore.get([codepoint, "kanji-write"]);

  return { read, write };
});

function getStatus(
  fsrs: FSRSCard | undefined
): "due" | "review" | "new" | null {
  if (!fsrs) {
    return null;
  }

  if (fsrs.state === State.New) {
    return "new";
  }

  if (
    fsrs.state === State.Learning ||
    fsrs.state === State.Relearning ||
    fsrs.due < new Date()
  ) {
    return "due";
  }

  return "review";
}

const readStatus = computed(() => getStatus(progress.value?.read?.fsrs));
const writeStatus = computed(() => getStatus(progress.value?.write?.fsrs));
</script>

<template>
  <RouterLink
    :to="kanjiRoute(kanji)"
    class="kanji"
    :data-read="readStatus"
    :data-write="writeStatus"
  >
    {{ kanji }}
  </RouterLink>
</template>

<style scoped>
.kanji {
  --border-color: var(--medium-gray);

  background: var(--background-strong);
  border: 2px solid var(--border-color);
  border-block-start-color: var(--write-color, var(--border-color));
  border-inline-end-color: var(--read-color, var(--border-color));
  border-block-end-color: var(--read-color, var(--border-color));
  border-inline-start-color: var(--write-color, var(--border-color));
  color: inherit;
  font-size: 1.2em;
  padding: 0.3ex;
  text-decoration: none;

  &[data-read="due"] {
    --read-color: var(--orange);
  }

  &[data-read="review"] {
    --read-color: var(--blue);
  }

  &[data-write="due"] {
    --write-color: var(--orange);
  }

  &[data-write="review"] {
    --write-color: var(--blue);
  }
}
</style>
