<script setup lang="ts">
import { computed, watchEffect } from "vue";

import { useKanjiVG, useKanjiVGViewBox } from "../helpers/kanjivg";
import { useRadical } from "../store/radicals";
import { KanjiComponent } from "../types";

import KanjiStrokesGroup from "./KanjiStrokesGroup.vue";

const props = defineProps<{
  literal: string;
  parts: KanjiComponent[];
}>();

const kanjiVG = useKanjiVG();
const viewBox = useKanjiVGViewBox();

const radical = computed(() => {
  for (const part of props.parts) {
    if (part.radical) {
      return part.radical;
    }
  }

  return null;
});

const componentInfo = useRadical(() => props.literal);

function accentColorOffset(deg: number): string {
  return `oklch(from var(--accent-color) l c calc(h + ${deg})`;
}

watchEffect(() => {
  const strokes = kanjiVG.value;

  if (!strokes) {
    return;
  }

  if (strokes.dataset.element === props.literal) {
    if (
      strokes.dataset.radical === "general" ||
      strokes.dataset.radical === "tradit"
    ) {
      strokes.style.color = "var(--green)";
    } else if (strokes.dataset.radical === "nelson") {
      strokes.style.color = "var(--orange)";
    } else {
      strokes.style.color = accentColorOffset(180);
    }
  }

  let i = -1;
  for (const group of strokes.querySelectorAll<SVGGElement>(
    `g[data-element="${props.literal}"]`
  )) {
    if (
      group.dataset.radical === "general" ||
      group.dataset.radical === "tradit"
    ) {
      group.style.color = "var(--green)";
      continue;
    }

    if (group.dataset.radical === "nelson") {
      group.style.color = "var(--orange)";
      continue;
    }

    if (!group.dataset.part || group.dataset.part === "1") {
      i += 1;
    }

    group.style.color = accentColorOffset(240 + 63 * i);
  }
});
</script>

<template>
  <div class="kanji-component-item">
    <svg v-if="kanjiVG" :viewBox="viewBox" class="kanji-component-strokes">
      <KanjiStrokesGroup class="strokes-group" :strokes="kanjiVG" />
    </svg>

    <div class="component-info">
      <span class="literal">
        {{ literal }}
      </span>

      <p class="meaning">
        <strong>{{ componentInfo?.meaning }}</strong>
        <span v-if="componentInfo?.reading" lang="ja">
          ({{ componentInfo.reading }})</span
        >
      </p>

      <span
        v-if="radical"
        class="is-radical"
        :class="{ 'is-nelson': radical === 'nelson' }"
      >
        <template v-if="radical === 'nelson'">Nelson radical</template>
        <template v-else>Radical</template>
      </span>
    </div>
  </div>
</template>

<style scoped>
.kanji-component-item {
  column-gap: 1em;
  display: flex;
}

.kanji-component-strokes {
  background: var(--background-strong);
  block-size: 5em;
  border-radius: 1ex;

  & .strokes-group {
    color: var(--light-gray);
  }
}

.component-info {
  align-items: start;
  align-self: center;
  column-gap: 1em;
  display: grid;
  grid-template:
    "literal radical" min-content
    "literal meaning" 1fr;
  justify-content: start;
}

.literal {
  font-size: 3em;
  font-weight: normal;
  grid-area: literal;
  line-height: 1em;
}

.meaning {
  grid-area: meaning;
  margin: 0;

  & strong {
    text-transform: capitalize;
  }
}

.is-radical {
  background: var(--green);
  border-radius: 1ex;
  color: var(--background-strong);
  font-size: 0.6em;
  font-weight: 600;
  padding: 0.5ex 1ex;
  justify-self: start;

  &.is-nelson {
    background-color: var(--orange);
  }
}
</style>
