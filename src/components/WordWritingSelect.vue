<script setup lang="ts">
import { zip } from "@runarberg/yta/sync";
import { computed, ref, useId } from "vue";

import { Furigana, Word } from "../types.ts";

import VocabularyWordFurigana from "./VocabularyWordFurigana.vue";

type ModelValue = Furigana | string | null;

const props = defineProps<{
  word: Word;
  default: Furigana;
  modelValue: ModelValue;
}>();

defineEmits<{
  "update:modelValue": [value: ModelValue];
}>();

const id = useId();
const anchorName = `--${id}`.replace(":", "-anchor-");

const noopWritings = computed(
  () =>
    props.word.writings
      ?.filter(
        (writing) => writing.irregular || writing.outdated || writing.searchOnly
      )
      .map(({ text }) => text) ?? []
);
const noopReadings = computed(
  () =>
    props.word.readings
      ?.filter(
        (reading) => reading.irregular || reading.outdated || reading.searchOnly
      )
      .map(({ text }) => text) ?? []
);

function furiganaEquals(aFurigana: Furigana, bFurigana: Furigana): boolean {
  if (aFurigana.length !== bFurigana.length) {
    return false;
  }

  for (const [a, b] of zip(aFurigana, bFurigana)) {
    if (a.ruby !== b.ruby || a.rt !== b.rt) {
      return false;
    }
  }

  return true;
}

const additionalFurigana = computed(
  () =>
    props.word.furigana?.filter(
      (other) =>
        !furiganaEquals(props.default, other.furigana) &&
        !noopWritings.value.includes(other.writing) &&
        !noopReadings.value.includes(other.reading)
    ) ?? []
);

const additionalReadings = computed(
  () =>
    props.word.readings?.filter(
      (reading) =>
        !reading.irregular &&
        !reading.outdated &&
        !reading.searchOnly &&
        !props.word.furigana?.some((other) => reading.text === other.reading)
    ) ?? []
);

const toggleButton = ref<HTMLButtonElement | null>(null);
const popoverEl = ref<HTMLElement | null>(null);
const open = ref(false);

function handleToggle(event: ToggleEvent) {
  open.value = event.newState === "open";
}

function handleBeforeToggle(event: ToggleEvent) {
  if (event.newState !== "open") {
    return;
  }

  // Polyfill the anchor positioning
  if (!("anchorName" in document.documentElement.style)) {
    const togglerBox = toggleButton.value?.getBoundingClientRect();
    const style = popoverEl.value?.style;

    if (style && togglerBox) {
      style.insetBlockStart = `${togglerBox.bottom + window.scrollY}px`;
      style.insetInlineEnd = `calc(100% - ${togglerBox.right}px)`;
    }

    // TODO: Apply fallback positions with an intersection observer.
  }
}
</script>

<template>
  <div
    v-if="additionalFurigana.length + additionalReadings.length > 0"
    class="word-writing-details popover-container"
  >
    <button
      ref="toggleButton"
      title="Additional Writings"
      class="toggle-button"
      :popovertarget="id"
    >
      <span class="writing-select-icon">か</span>
      <small class="writing-select-count"
        >(+{{
          additionalFurigana.length + additionalReadings.length + 1
        }})</small
      >
    </button>

    <ul
      :id="id"
      ref="popoverEl"
      class="writing-list popover"
      popover
      @beforetoggle="handleBeforeToggle"
      @toggle="handleToggle"
    >
      <li>
        <button
          class="select-button"
          :disabled="modelValue === null"
          @click="$emit('update:modelValue', null)"
        >
          <VocabularyWordFurigana :furigana="default" />
        </button>
      </li>

      <li v-for="furigana of additionalFurigana" class="additional-writing">
        <button
          class="select-button"
          :disabled="modelValue === furigana.furigana"
          @click="$emit('update:modelValue', furigana.furigana)"
        >
          <VocabularyWordFurigana :furigana="furigana.furigana" />
        </button>
      </li>

      <li v-for="reading of additionalReadings">
        <button
          class="select-button"
          :disabled="modelValue === reading.text"
          @click="$emit('update:modelValue', reading.text)"
        >
          {{ reading.text }}
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.toggle-button {
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  font-size: 1em;
  font-weight: 400;
  margin: 0;
  padding: 0;

  .popover-container:has(:popover-open) & {
    color: var(--accent-color);
  }
}

.writing-select-icon {
  font-weight: 700;
}

.writing-select-count {
  margin-inline-start: 0.5ex;
}

.popover {
  background: var(--background-strong);
  border: 1px solid var(--accent-color);
  border-radius: 0.5ex;
  inline-size: max-content;
  inset: auto;
  margin-inline: 0;
  max-inline-size: 15ch;
  padding: 1ex;
  position: absolute;
}

.writing-list {
  list-style: none;
  margin: 0;

  & > li:not(:first-child) {
    margin-block-start: 1ex;
  }
}

.select-button {
  background: none;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  font-family: inherit;
  padding-block: 0.2ex;
  padding-inline: 0;

  &:disabled {
    color: var(--accent-color);
  }
}

@supports (anchor-name: --app-menu-anchor) {
  .toggle-button {
    anchor-name: v-bind(anchorName);
  }

  .popover {
    position-anchor: v-bind(anchorName);
    position-area: block-end span-inline-start;
    position-try: flip-block, flip-inline, flip-block flip-inline;
  }
}
</style>
