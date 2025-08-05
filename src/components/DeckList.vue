<script setup lang="ts">
import { deckBrowserRoute } from "../router.ts";
import { useDecks } from "../store/decks.ts";
import AppButton from "./AppButton.vue";
import DeckListItem from "./DeckListItem.vue";

const decks = useDecks();
</script>

<template>
  <section>
    <p>
      Decks allow you do keep track of your practice, such that you know which
      kanji you already know, which you should learn next, and which you need to
      review.
    </p>

    <template v-if="decks && decks.length > 0">
      <ol class="deck-list">
        <li v-for="deck of decks" :key="deck.name" class="deck-list-item">
          <DeckListItem :deck="deck" />
        </li>
      </ol>
    </template>

    <template v-else-if="decks">
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
ol.deck-list {
  list-style: none;
  margin: 0;
  padding: 0;

  & > li.deck-list-item:not(:first-child) {
    margin-block-start: 1ex;
  }
}
</style>
