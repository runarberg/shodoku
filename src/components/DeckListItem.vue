<script setup lang="ts">
import { computed, useId } from "vue";
import { LocationQueryValue, useRoute } from "vue-router";

import { Deck } from "../types.ts";
import { useLiveQuery } from "../helpers/db";
import { db } from "../db";
import DeckKanjiCards from "./DeckKanjiCards.vue";

const props = defineProps<{
  deck: Deck;
}>();

const labelId = useId();
const route = useRoute();

const label = computed(() => {
  if (props.deck.category === "genki") {
    return `Genki ${props.deck.label}`;
  }

  return props.deck.label;
});

const { value: cardCount } = useLiveQuery(() =>
  db.cards.where("decks").equals(props.deck.name).count()
);

function toArray(
  item: LocationQueryValue | LocationQueryValue[]
): LocationQueryValue[] {
  if (!item) {
    return [];
  }

  if (typeof item === "string") {
    return [item];
  }

  return item;
}

const expanded = computed(() =>
  toArray(route.query.deck).includes(props.deck.name)
);

const toggleExpanded = computed(() => {
  const { name } = props.deck;
  const expandedDecks = toArray(route.query.deck);
  const deckQuery = expanded.value
    ? expandedDecks.filter((other) => other !== name)
    : [...expandedDecks, name];

  return {
    query: { ...route.query, deck: deckQuery },
  };
});
</script>

<template>
  <article class="deck-list-item" :aria-labelledby="labelId">
    <strong :id="labelId" class="label">
      <RouterLink :to="toggleExpanded" :aria-pressed="expanded" replace>
        {{ label }}
      </RouterLink>
    </strong>

    <div class="status">
      <span class="card-count">({{ cardCount }} cards)</span>
    </div>

    <DeckKanjiCards v-if="expanded" :deck="deck.name" class="cards" />
  </article>
</template>

<style scoped>
.deck-list-item {
  column-gap: 1em;
  display: grid;
  grid-template:
    "label status"
    "cards cards"
    / auto 1fr;
  justify-content: start;
}

.label {
  font-size: 1.1em;
  font-weight: 600;
  grid-area: label;

  & a {
    color: var(--accent-color);
    text-decoration: none;
  }
}

.status {
  grid-area: status;
}

.cards {
  grid-area: cards;
}
</style>
