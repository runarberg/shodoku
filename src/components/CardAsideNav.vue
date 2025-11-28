<script setup lang="ts" generic="T extends number | string">
import { computed, ref } from "vue";

import AppIcon from "./AppIcon.vue";

const props = defineProps<{
  cardId: T;
  deckCards: T[];
}>();

const index = computed(() => props.deckCards.indexOf(props.cardId));
const start = computed(() => Math.max(0, index.value - 4));
const end = computed(() => Math.min(props.deckCards.length, index.value + 5));

const cards = computed(() => {
  const { length } = props.deckCards;

  if (length <= 9) {
    return props.deckCards;
  }

  if (start.value === 0) {
    return props.deckCards.slice(0, 9);
  }

  if (end.value === length) {
    return props.deckCards.slice(length - 9);
  }

  return props.deckCards.slice(start.value, end.value);
});

const expanded = ref(true);
</script>

<template>
  <nav v-if="index !== -1" class="card-aside-nav">
    <details
      :open="expanded"
      class="nav-details"
      @toggle="expanded = ($event.target as HTMLDetailsElement).open"
    >
      <summary>
        <span class="label"><slot name="label" /></span>

        <AppIcon v-if="expanded" icon="chevron-down" />
        <AppIcon v-else icon="chevron-up" />
      </summary>

      <ol v-if="expanded" class="deck-index">
        <li v-for="id of cards" :key="id">
          <slot name="card" :card-id="id" />
        </li>
      </ol>
    </details>
  </nav>
</template>

<style scoped>
.card-aside-nav {
  align-items: center;
  display: flex;
  flex-direction: column;

  @media screen and (max-width: 75ch) {
    align-items: start;
  }
}

.nav-details summary {
  align-items: center;
  display: flex;
  color: var(--medium-gray);
  cursor: pointer;
  writing-mode: vertical-lr;

  &::-webkit-details-marker {
    display: none;
  }

  @media screen and (max-width: 75ch) {
    writing-mode: horizontal-tb;
  }
}

.label {
  color: inherit;
  text-decoration: none;
}

.deck-index {
  align-items: center;
  column-gap: 1ex;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  list-style: none;
  margin-block: 1ex;
  padding: 0;

  @media screen and (max-width: 75ch) {
    flex-direction: row;
  }
}

:slotted(.link) {
  border-radius: 0.4ex;
  color: var(--accent-color);
  font-weight: 400;
  text-decoration: none;
  padding: 0.25ex;
  border: 1px solid transparent;
}

:slotted(.link.link-active) {
  font-weight: 600;
  background: var(--background-light);
  border-color: currentColor;
}
</style>
