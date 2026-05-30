<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { pipe } from "yta";
import { groupBy, map } from "yta/sync";

import { categoryLabel } from "../helpers/decks.ts";
import { deckBrowserRoute } from "../router.ts";
import { provideDeckStatuses, useDecks } from "../store/decks.ts";
import AppButton from "./AppButton.vue";
import CardStatusCount from "./CardStatusCount.vue";
import DeckListItem from "./DeckListItem.vue";

const route = useRoute();
const allDecks = useDecks();
const deckStatuses = provideDeckStatuses();

const initialExpandedDeckNames = !route.query.deck
  ? []
  : typeof route.query.deck === "string"
    ? [route.query.deck]
    : route.query.deck;

const deckCategories = computed(() =>
  pipe(
    allDecks.value ?? [],
    groupBy((deck) => deck.category),
  ),
);

const categoryStatuses = computed(() =>
  pipe(
    deckCategories.value,
    map(([category, decks]) => {
      const counts = {
        remaining: 0,
        due: 0,
        review: 0,
        know: 0,
        total: 0,
      };

      for (const deck of decks) {
        const cardTypeCount = deck.cardTypes.length;
        counts.total += deck.cards.length;

        for (const status of deckStatuses.get(deck.name)?.values() ?? []) {
          counts.remaining += status.new / cardTypeCount;
          counts.due += status.due / cardTypeCount;
          counts.review += status.review / cardTypeCount;
          counts.know += status.know / cardTypeCount;
        }
      }

      return [category, counts] as const;
    }),
    (entries) => new Map(entries),
  ),
);
</script>

<template>
  <section>
    <p>
      Decks allow you do keep track of your practice, such that you know which
      kanji you already know, which you should learn next, and which you need to
      review.
    </p>

    <ul v-if="deckCategories.size > 0" class="category-list">
      <li v-for="[category, decks] of deckCategories" :key="category">
        <ol v-if="decks.length <= 1" class="deck-list">
          <li v-for="deck of decks" :key="deck.name" class="deck-list-item">
            <DeckListItem :deck="deck" />
          </li>
        </ol>

        <details
          v-else
          class="category-details"
          :open="
            decks.some((deck) => initialExpandedDeckNames.includes(deck.name))
          "
        >
          <summary class="category-summary">
            <span class="category-label">
              {{ categoryLabel(category) }}
            </span>
            <CardStatusCount v-bind="categoryStatuses.get(category)" />
          </summary>

          <ol class="deck-list">
            <li v-for="deck of decks" :key="deck.name" class="deck-list-item">
              <DeckListItem :deck="deck" />
            </li>
          </ol>
        </details>
      </li>
    </ul>

    <template v-else-if="allDecks !== null">
      <p>
        You don‘t have any decks.
        <RouterLink :to="deckBrowserRoute"> Add your first deck </RouterLink> by
        clicking the button below.
      </p>

      <AppButton :to="deckBrowserRoute" prefix-icon="plus">
        Add Deck
      </AppButton>
    </template>
  </section>
</template>

<style scoped>
.category-list,
.deck-list {
  list-style: none;
  margin: 0;
  padding: 0;

  & > li:not(:first-child) {
    margin-block-start: 1ex;
  }
}

.category-details .deck-list {
  margin-block-start: 1ex;
  margin-inline-start: 1ex;

  &:deep(.label, .status) {
    font-size: 0.9em;
  }
}

.category-summary {
  display: inline-block;
}

.category-label {
  font-size: 1.1em;
  font-weight: 600;
  color: var(--accent-color);
  cursor: pointer;
}
</style>
