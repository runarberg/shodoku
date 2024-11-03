<script setup lang="ts">
import { Card as FSRSCard, State } from "ts-fsrs";
import { computed } from "vue";

import { db } from "../db/index.ts";
import { useLiveQuery } from "../helpers/db.ts";
import { kanjiRoute } from "../router.ts";
import { useFsrs } from "../helpers/fsrs";

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

const fsrs = useFsrs();

function getStatus(
  fsrsCard: FSRSCard | undefined
): "know" | "review" | "due" | "new" | null {
  if (!fsrsCard) {
    return null;
  }

  if (fsrsCard.state === State.New) {
    return "new";
  }

  if (
    fsrsCard.state === State.Learning ||
    fsrsCard.state === State.Relearning ||
    fsrsCard.due < new Date()
  ) {
    return "due";
  }

  if (fsrs.value.get_retrievability(fsrsCard, new Date(), false) > 0.99) {
    return "know";
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

  &[data-read="know"] {
    --read-color: var(--green);
  }

  &[data-read="review"] {
    --read-color: var(--blue);
  }

  &[data-read="due"] {
    --read-color: var(--orange);
  }

  &[data-write="know"] {
    --write-color: var(--green);
  }

  &[data-write="review"] {
    --write-color: var(--blue);
  }

  &[data-write="due"] {
    --write-color: var(--orange);
  }
}
</style>
