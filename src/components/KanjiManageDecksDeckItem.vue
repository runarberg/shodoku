<script setup lang="ts">
import { computed } from "vue";

import { editDeck } from "../db/decks.ts";
import { Deck, KanjiInfo } from "../types.ts";
import AppCheckbox from "./AppCheckbox.vue";

const props = defineProps<{
  kanji: KanjiInfo;
  deck: Deck;
}>();

const deckHasCard = computed(() =>
  props.deck.cards.includes(props.kanji.codepoint),
);

async function toggleActive() {
  const { deck } = props;
  const { cards } = deck;
  const { codepoint } = props.kanji;

  if (deckHasCard.value) {
    editDeck({
      ...deck,
      cards: cards.filter((other) => other !== codepoint),
    });
  } else if (!cards.includes(codepoint)) {
    editDeck({ ...deck, cards: [...cards, codepoint] });
  }
}
</script>

<template>
  <AppCheckbox :model-value="deckHasCard" @update:model-value="toggleActive">
    <template #label>
      <span class="label" :class="{ active: deckHasCard }">
        {{ deck.label }}
      </span>
    </template>
  </AppCheckbox>
</template>

<style scoped>
.label {
  font-weight: 400;

  &.active {
    color: var(--accent-color);
    font-weight: 600;
  }
}
</style>
