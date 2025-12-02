<script setup lang="ts">
import { computed, watchEffect } from "vue";

import { useKanjiComponent } from "../helpers/kanji-components.ts";
import { useKanjiVG, useKanjiVGViewBox } from "../helpers/kanjivg.ts";
import { kanjiComponentRoute } from "../router.ts";
import { KanjiComponent } from "../types.ts";
import KanjiStrokesGroup from "./KanjiStrokesGroup.vue";

const props = defineProps<{
  literal: string;
  original?: string | null;
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

const phonetic = computed(() => {
  for (const part of props.parts) {
    if (part.phon) {
      return part.phon;
    }
  }

  return null;
});

const componentInfo = useKanjiComponent(() => props.literal);
const original = computed(() => props.parts.at(0)?.original);
const originalComponentInfo = useKanjiComponent(original);

const meaning = computed(
  () =>
    originalComponentInfo.value?.radical?.en ??
    originalComponentInfo.value?.meaning ??
    componentInfo.value?.radical?.en ??
    componentInfo?.value?.meaning,
);

const reading = computed(
  () =>
    originalComponentInfo.value?.radical?.jp ??
    originalComponentInfo.value?.reading ??
    componentInfo.value?.radical?.jp ??
    componentInfo?.value?.reading,
);

const radicalNumber = computed(
  () =>
    originalComponentInfo.value?.radical?.number ??
    componentInfo.value?.radical?.number,
);

const isCDPCodePoint = computed(() => props.literal.startsWith("CDP-"));

// These are exceptions from the kanjivg dataset. These are using the
// characters from the radical unicode block instead of the CJK
// codeblock as is usual. In these cases, the whole character is the
// only one denoted with the CJK block while the parts are all from
// the radical block.
//
// See: https://kanjivg.tagaini.net/radicals.html#other-radicals
const rogueCJKRadicalPairs = [
  ["\u{5f50}", "\u{2e95}"],
  ["\u{72ad}", "\u{2ea8}"],
  ["\u{961d}", "\u{2ed6}"],
];
function replaceCJKRadical(literal: string): string {
  for (const [cjkBlock, radicalBlock] of rogueCJKRadicalPairs) {
    if (literal === cjkBlock) {
      return radicalBlock;
    }
  }

  return literal;
}

function accentColorOffset(deg: number): string {
  return `oklch(from var(--accent-color) l c ${deg + 3})`;
}

watchEffect(() => {
  const strokes = kanjiVG.value;

  if (!strokes) {
    return;
  }

  if (
    strokes.dataset.element === props.literal &&
    (!props.original || props.original === strokes.dataset.original)
  ) {
    if (
      strokes.dataset.radical === "general" ||
      strokes.dataset.radical === "tradit"
    ) {
      strokes.style.color = "var(--green)";
    } else if (
      strokes.dataset.radical === "nelson" ||
      strokes.dataset.radical === "jis"
    ) {
      strokes.style.color = "var(--bluegreen)";
    } else if (strokes.dataset.phon === props.literal) {
      strokes.style.color = "var(--gold)";
    } else {
      strokes.style.color = accentColorOffset(180);
    }
  }

  let i = -1;
  for (const group of strokes.querySelectorAll<SVGGElement>(
    `g[data-element="${props.literal}"]`,
  )) {
    if (props.original && props.original !== group.dataset.original) {
      continue;
    }

    if (
      group.dataset.radical === "general" ||
      group.dataset.radical === "tradit"
    ) {
      group.style.color = "var(--green)";
      continue;
    }

    if (group.dataset.radical === "nelson" || group.dataset.radical === "jis") {
      group.style.color = "var(--bluegreen)";
      continue;
    }

    if (group.dataset.phon) {
      group.style.color = "var(--gold)";
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
  <RouterLink
    :to="kanjiComponentRoute(replaceCJKRadical(literal))"
    class="kanji-component-item"
  >
    <svg v-if="kanjiVG" :viewBox="viewBox" class="kanji-component-strokes">
      <KanjiStrokesGroup class="strokes-group" :strokes="kanjiVG" />
    </svg>

    <div class="component-info">
      <span v-if="!isCDPCodePoint" class="literal">{{ literal }}</span>

      <p class="meaning">
        <strong>{{ meaning }}</strong>
        <span v-if="original" class="original" lang="ja"> {{ original }}</span>
        <span v-if="reading" lang="ja"> ({{ reading }})</span>
      </p>

      <div class="tags">
        <span
          v-if="radical"
          class="is-radical"
          :class="{
            'is-nelson': radical === 'nelson',
            'is-jis': radical === 'jis',
          }"
        >
          <template v-if="radical === 'nelson'">Nelson radical</template>
          <template v-else-if="radical === 'jis'">JIS radical</template>
          <template v-else>Radical</template>

          <template v-if="radicalNumber">&nbsp;{{ radicalNumber }}</template>
        </span>

        <span v-if="phonetic" class="is-phonetic">Phonetic</span>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.kanji-component-item {
  color: inherit;
  column-gap: 1em;
  display: flex;
  text-decoration: none;
}

.kanji-component-strokes {
  background: var(--background-strong);
  block-size: 5em;
  border-radius: 1ex;
  flex-shrink: 0;

  & .strokes-group {
    color: light-dark(var(--light-gray), var(--medium-dark-gray));
  }
}

.component-info {
  align-items: start;
  align-self: center;
  column-gap: 1em;
  display: grid;
  grid-template:
    "literal tags" min-content
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

  & .original {
    padding-inline-start: 1ex;
  }
}

.tags {
  column-gap: 0.5ex;
  display: flex;
  grid-area: tags;
}

.is-radical,
.is-phonetic {
  border-radius: 1ex;
  color: var(--background-strong);
  font-size: 0.6em;
  font-weight: 600;
  padding: 0.5ex 1ex;
  justify-self: start;
}

.is-radical {
  background: var(--green);

  &.is-nelson,
  &.is-jis {
    background-color: var(--bluegreen);
  }
}

.is-phonetic {
  background: var(--gold);
}
</style>
