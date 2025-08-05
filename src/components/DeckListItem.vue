<script setup lang="ts">
import { computed, onMounted, ref, useId } from "vue";
import { useRoute } from "vue-router";

import { deckLabel } from "../helpers/decks.ts";
import { formatPercent } from "../helpers/formats.ts";
import { useDeckStatus } from "../store/decks.ts";
import { Deck } from "../types.ts";
import DeckKanjiCards from "./DeckKanjiCards.vue";

const props = defineProps<{
  deck: Deck;
}>();

const el = ref<HTMLElement | null>(null);
const labelId = useId();
const route = useRoute();

const label = computed(() => deckLabel(props.deck));

const expandedDeckNames = computed(() => {
  if (!route.query.deck) {
    return [];
  }

  if (typeof route.query.deck === "string") {
    return [route.query.deck];
  }

  return route.query.deck;
});

const expanded = computed(() =>
  expandedDeckNames.value.includes(props.deck.name),
);

const toggleExpanded = computed(() => {
  const { name } = props.deck;
  const deckQuery = expanded.value
    ? expandedDeckNames.value.filter((other) => other !== name)
    : [...expandedDeckNames.value, name];

  return {
    query: { ...route.query, deck: deckQuery },
  };
});

const deckStatus = useDeckStatus(() => props.deck.name);
function sumStatus(status: "new" | "due" | "review" | "know") {
  if (!deckStatus.value) {
    return 0;
  }

  const { "kanji-read": read, "kanji-write": write } = deckStatus.value;

  return (read[status] + write[status]) / 2;
}

const newCount = computed(() => sumStatus("new"));
const dueCount = computed(() => sumStatus("due"));
const reviewCount = computed(() => sumStatus("review"));
const knowCount = computed(() => sumStatus("know"));

onMounted(() => {
  if (expanded.value && expandedDeckNames.value.length === 1) {
    el.value?.scrollIntoView({ block: "start" });
  }
});
</script>

<template>
  <article ref="el" class="deck-list-item" :aria-labelledby="labelId">
    <strong :id="labelId" class="label">
      <RouterLink :to="toggleExpanded" :aria-pressed="expanded" replace>
        {{ label }}
      </RouterLink>
    </strong>

    <div class="status">
      <span class="count total-count">{{ deck.cards.length }} cards</span>
      <template v-if="deckStatus">
        <span v-if="knowCount > 0" class="count know-count">
          {{ formatPercent(knowCount / deck.cards.length) }} know
        </span>
        <span v-if="reviewCount > 0" class="count review-count">
          {{ formatPercent(reviewCount / deck.cards.length) }} reviewed
        </span>
        <span v-if="dueCount > 0" class="count due-count">
          {{ formatPercent(dueCount / deck.cards.length) }} due
        </span>
        <span v-if="newCount > 0" class="count new-count">
          {{ formatPercent(newCount / deck.cards.length) }} remaining
        </span>
      </template>
    </div>

    <DeckKanjiCards v-if="expanded" :kanji="deck.cards" class="cards" />
  </article>
</template>

<style scoped>
.deck-list-item {
  column-gap: 1em;
  display: grid;
  grid-template:
    "label"
    "status"
    "cards"
    / 1fr;
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
  column-gap: 1ex;
  display: flex;
  font-size: 0.9em;
  grid-area: status;
}

.count {
  font-weight: 500;

  &.know-count {
    color: var(--green);
  }

  &.review-count {
    color: var(--blue);
  }

  &.due-count {
    color: var(--orange);
  }

  &.new-count {
    color: var(--medium-gray);
  }
}

.cards {
  grid-area: cards;
  margin-block: 1ex 1em;
}
</style>
