<script setup lang="ts">
import { Card as FSRSCard, State } from "ts-fsrs";
import { computed } from "vue";
import { RouteLocationRaw } from "vue-router";

import { db } from "../db/index.ts";
import { useLiveQuery } from "../helpers/db.ts";
import { useFsrs } from "../helpers/fsrs.ts";
import { isYoon, randomYoon } from "../helpers/kana.ts";
import { WEEK } from "../helpers/time.ts";
import { kanaRoute, kanjiRoute } from "../router.ts";
import { knownMinDueWeeks, knownMinRetention } from "../store/reviews.ts";

const props = defineProps<{
  codepoint: number;
  type: "kanji" | "kana";
}>();

const literal = computed(() => String.fromCodePoint(props.codepoint));

const { result: progress } = useLiveQuery(async () => {
  const { codepoint } = props;
  const progressStore = (await db).transaction("progress").store;

  const read = await progressStore.get([codepoint, `${props.type}-read`]);
  const write = await progressStore.get([codepoint, `${props.type}-write`]);

  return { read, write };
});

const route = computed<RouteLocationRaw>(() => {
  if (props.type === "kanji") {
    return kanjiRoute(literal.value);
  }

  if (isYoon(literal.value)) {
    return kanaRoute(randomYoon(literal.value));
  }

  return kanaRoute(literal.value);
});

const fsrs = useFsrs();

function isProficient(fsrsCard: FSRSCard) {
  const now = new Date();
  const minRetentionProb = knownMinRetention.value / 100;
  const minDueDate = new Date(Date.now() + knownMinDueWeeks.value * WEEK);
  const r = fsrs.value.get_retrievability(fsrsCard, now, false);

  return r > minRetentionProb && fsrsCard.due > minDueDate;
}

function getStatus(
  fsrsCard: FSRSCard | undefined,
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

  if (isProficient(fsrsCard)) {
    return "know";
  }

  return "review";
}

const readStatus = computed(() => getStatus(progress.value?.read?.fsrs));
const writeStatus = computed(() => getStatus(progress.value?.write?.fsrs));
</script>

<template>
  <RouterLink
    :to="route"
    class="kanji"
    :data-read="readStatus"
    :data-write="writeStatus"
  >
    <template v-if="isYoon(literal)">◌</template>
    {{ literal }}
  </RouterLink>
</template>

<style scoped>
.kanji {
  --border-color: var(--medium-gray);
  --background-mix: 5%;
  --background-write-color: color-mix(
    in oklch,
    var(--write-color, var(--background-strong)) var(--background-mix),
    var(--background-strong)
  );
  --background-read-color: color-mix(
    in oklch,
    var(--read-color, var(--background-strong)) var(--background-mix),
    var(--background-strong)
  );

  background: var(--background-strong)
    linear-gradient(
      in oklch 45deg,
      var(--background-read-color),
      var(--background-write-color)
    );
  border: 2px solid var(--border-color);
  border-top-color: var(--write-color, var(--border-color));
  border-right-color: var(--write-color, var(--border-color));
  border-bottom-color: var(--read-color, var(--border-color));
  border-left-color: var(--read-color, var(--border-color));
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

  @media (prefers-color-scheme: dark) {
    --background-mix: 30%;
  }
}
</style>
