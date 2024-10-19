<script setup lang="ts">
import { computed, ref } from "vue";

import { deckLabel } from "../helpers/decks.ts";
import { kanjiRoute } from "../router.ts";
import { Deck } from "../types.ts";

import AppIcon from "./AppIcon.vue";

const props = defineProps<{
  cardId: number;
  deck: Deck;
}>();

const index = computed(() => props.deck.cards.indexOf(props.cardId));
const start = computed(() => Math.max(0, index.value - 5));
const end = computed(() => Math.min(props.deck.cards.length, start.value + 10));
const startOffset = computed(() => end.value - start.value - 9);

const expanded = ref(true);
</script>

<template>
  <nav v-if="index !== -1" class="kanji-aside-nav">
    <details
      :open="expanded"
      class="nav-details"
      @toggle="expanded = ($event.target as HTMLDetailsElement).open"
    >
      <summary>
        <span class="label">{{ deckLabel(deck) }}</span>

        <AppIcon v-if="expanded" icon="chevron-down" />
        <AppIcon v-else icon="chevron-up" />
      </summary>

      <ol v-if="expanded" class="kanji-deck-index">
        <li v-for="id of deck.cards.slice(start + startOffset, end)">
          <RouterLink
            :to="kanjiRoute(String.fromCodePoint(id))"
            :class="{ 'kanji-link-active': id === cardId }"
            class="kanji-link"
          >
            {{ String.fromCodePoint(id) }}
          </RouterLink>
        </li>
      </ol>
    </details>
  </nav>
</template>

<style scoped>
.kanji-aside-nav {
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

  @media screen and (max-width: 75ch) {
    writing-mode: horizontal-tb;
  }
}

.label {
  color: inherit;
  text-decoration: none;
}

.kanji-deck-index {
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

.kanji-link {
  border-radius: 0.4ex;
  color: var(--accent-color);
  font-weight: 500;
  text-decoration: none;
  padding: 0.25ex;
  border: 1px solid transparent;

  &.kanji-link-active {
    background: oklch(100% none none / 0.75);
    border-color: currentColor;
  }
}
</style>
