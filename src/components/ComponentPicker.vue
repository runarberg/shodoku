<script setup lang="ts">
import { useId } from "vue";

import { useComponentPicker } from "../helpers/component-picker.ts";
import AppButton from "./AppButton.vue";
import AppIcon from "./AppIcon.vue";

defineEmits<{
  select: [literal: string];
  close: [];
}>()

const { allRadicals, filteredRadicals, kanjiSelection, selectedRadicals } = useComponentPicker();
const id = useId();

function toggleRadical(literal: string) {
  if (selectedRadicals.has(literal)) {
    selectedRadicals.delete(literal);
  } else {
    selectedRadicals.add(literal);
  }
}
</script>

<template>
  <div class="component-picker">
    <div class="control-buttons">
      <AppButton
        class="clear-button"
        inline
        :disabled="selectedRadicals.size === 0"
        @click="selectedRadicals.clear()"
      >
        Clear
      </AppButton>

      <AppButton
        class="close-button"
        inline
        @click="$emit('close')"
      >
        <AppIcon icon="x-mark" />
      </AppButton>
    </div>

    <p v-if="selectedRadicals.size === 0" class="empty-message">
      Select one or more components below. Pick any of the resulting kanji.
    </p>

    <ol v-else class="list kanji-list">
      <li v-for="[strokeCount, kanji] of kanjiSelection" :key="strokeCount"
        :aria-labelledby="`${id}/kanji-list/${strokeCount}`" class="kanji-list-item">
        <strong :id="`${id}/kanji-list/${strokeCount}`" class="stroke-count-label">
          {{ strokeCount }}
        </strong>

        <ol class="list kanji-literal-list">
          <li v-for="literal of kanji" :key="literal" class="kanji-literal-list-item">
            <button class="kanji-select-button" @click="$emit('select', literal)">
              {{ literal }}
            </button>
          </li>
        </ol>
      </li>
    </ol>

    <ol class="list radical-list">
      <li v-for="[strokeCount, radicals] of allRadicals" :key="strokeCount"
        :aria-labelledby="`${id}/radical-list/${strokeCount}`" class="radical-list-item">
        <strong :id="`${id}/radical-list/${strokeCount}`" class="stroke-count-label">
          {{ strokeCount }}
        </strong>

        <ol class="list radical-literal-list">
          <li v-for="literal of radicals" :key="literal" class="radical-literal-list-item">
            <button class="radical-toggle-button" :aria-pressed="selectedRadicals.has(literal)"
              :disabled="filteredRadicals.size > 0 && !filteredRadicals.has(literal)" @click="toggleRadical(literal)">
              {{ literal }}
            </button>
          </li>
        </ol>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.component-picker {
  background: oklch(from var(--background-strong) l c h / 0.4);
  border: 1px solid var(--accent-color);
  border-radius: 3px;
  display: flex;
  flex-flow: column;
  padding: 1em;
  row-gap: 1em;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.empty-message {
  align-self: center;
  align-items: center;
  block-size: 8em;
  color: var(--text-light);
  display: flex;
  margin: 0;
}

.kanji-list {
  block-size: 8em;
  overflow-y: auto;
}

.kanji-list,
.radical-list {
  align-content: start;
  align-items: start;
  display: flex;
  flex-wrap: wrap;
  gap: 0.2ex;
  justify-content: start;
}

.kanji-list-item,
.kanji-literal-list,
.radical-list-item,
.radical-literal-list {
  display: contents;
}

.stroke-count-label,
.kanji-literal-list-item,
.radical-literal-list-item {
  align-items: center;
  block-size: 1.5em;
  display: flex;
  font-size: 1.2em;
  inline-size: 1.5em;
  justify-content: center;
}

.kanji-select-button,
.radical-toggle-button {
  border: 1px solid var(--accent-color);
  border-radius: 0.5ex;
  background: var(--background-strong);
  cursor: pointer;
  color: var(--text-color);
  font-family: inherit;
  font-size: inherit;
  font-weight: 400;
  line-height: 1em;
  padding: 0.25ex;

  &[aria-pressed="true"] {
    background: var(--accent-color);
    color: var(--background-strong);
  }

  &:disabled {
    background: var(--background-light);
    border-color: var(--accent-color-light);
    color: var(--text-light);
    cursor: default;
  }
}

.control-buttons {
  align-self: end;
  column-gap: 1ex;
  display: flex;
  justify-content: end;
}
</style>
