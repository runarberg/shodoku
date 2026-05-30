<script setup lang="ts">
import { computed, onMounted, useId, useTemplateRef } from "vue";
import { useRoute } from "vue-router";

import { type DeckStatusCount } from "../db/decks.ts";
import { deckLabel } from "../helpers/decks.ts";
import { practiceDeckRoute } from "../router.ts";
import { useDeckStatus } from "../store/decks.ts";
import { Deck } from "../types.ts";
import AppButton from "./AppButton.vue";
import AppIcon from "./AppIcon.vue";
import CardStatusCount from "./CardStatusCount.vue";
import DeckKanaCards from "./DeckKanaCards.vue";
import DeckKanjiCards from "./DeckKanjiCards.vue";

const props = defineProps<{
  deck: Deck;
}>();

const el = useTemplateRef("el");
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

function sumStatus(statusKey: keyof DeckStatusCount) {
  if (!deckStatus.value) {
    return 0;
  }

  let sum = 0;
  let n = 0;
  for (const [, counts] of deckStatus.value) {
    sum += counts[statusKey];
    n += 1;
  }

  return sum / n;
}

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

    <CardStatusCount
      class="status"
      :total="deck.cards.length"
      :know="sumStatus('know')"
      :review="sumStatus('review')"
      :due="sumStatus('due')"
      :remaining="sumStatus('new')"
    />

    <template v-if="expanded">
      <AppButton
        :to="practiceDeckRoute(deck.name)"
        class="practice-button"
        slim
      >
        <AppIcon icon="play" />
      </AppButton>

      <DeckKanaCards
        v-if="deck.category === 'kana'"
        :name="deck.name"
        :kana="deck.cards"
        class="cards"
      />

      <DeckKanjiCards v-else :kanji="deck.cards" class="cards" />
    </template>
  </article>
</template>

<style scoped>
.deck-list-item {
  column-gap: 1em;
  display: grid;
  grid-template:
    "label  practice-button"
    "status practice-button"
    "cards  cards"
    / 1fr auto;
  justify-content: start;
}

.label {
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
  margin-block: 1ex 1em;
}

.practice-button {
  align-self: start;
  font-size: 0.8em;
  grid-area: practice-button;
}
</style>
