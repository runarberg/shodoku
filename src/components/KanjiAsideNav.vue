<script setup lang="ts">
import { deckLabel } from "../helpers/decks.ts";
import { kanjiRoute } from "../router.ts";
import { Deck } from "../types.ts";
import CardAsideNav from "./CardAsideNav.vue";

defineProps<{
  cardId: number;
  deck: Deck;
}>();
</script>

<template>
  <CardAsideNav :deck-cards="deck.cards" :card-id="cardId">
    <template #label>{{ deckLabel(deck) }}</template>
    <template #card="{ cardId: other }">
      <RouterLink
        :to="kanjiRoute(String.fromCodePoint(other))"
        :class="{ 'link-active': other === cardId }"
        class="link"
      >
        {{ String.fromCodePoint(other) }}
      </RouterLink>
    </template>
  </CardAsideNav>
</template>
