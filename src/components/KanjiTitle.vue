<script setup lang="ts">
import { computed } from "vue";

import { deckLabel } from "../helpers/decks.ts";
import { useCardRetrievability } from "../helpers/fsrs.ts";
import { DECKS_ROUTE_NAME } from "../router.ts";
import { useDecksContainingCard } from "../store/decks.ts";
import { KanjiInfo } from "../types.ts";
import AppLabel from "./AppLabel.vue";
import CardRetrievabilityLabel from "./CardRetrievabilityLabel.vue";

const props = withDefaults(
  defineProps<{
    kanji: KanjiInfo;
    hideLiteral?: boolean;
    hideMeaning?: boolean;
    actions?: "explore" | "review";
  }>(),
  {
    hideLiteral: false,
    hideMeaning: false,
    actions: "explore",
  },
);

const freq = computed(() => {
  const { freq: n } = props.kanji;

  if (!n) {
    return null;
  }

  if (n <= 50) {
    return 50;
  }

  if (n <= 100) {
    return 100;
  }

  if (n <= 200) {
    return 200;
  }

  if (n <= 500) {
    return 500;
  }

  if (n <= 1000) {
    return 1000;
  }

  return null;
});

const decks = useDecksContainingCard(() => props.kanji.codepoint);
const retrievability = useCardRetrievability(
  () => props.kanji.codepoint,
  ["kanji-write", "kanji-read"],
);
</script>

<template>
  <header class="kanji-title">
    <h2 v-show="!hideLiteral" class="literal" lang="ja">
      {{ kanji.literal }}
    </h2>

    <p v-show="!hideMeaning" class="main-meaning meaning">
      <strong>{{ kanji.meanings?.at(0) }}</strong>
    </p>

    <aside class="labels">
      <AppLabel
        v-if="freq && !decks.some(({ name }) => name === `news-top-${freq}`)"
        class="freq-label"
      >
        Top {{ freq }}
      </AppLabel>

      <RouterLink
        v-for="deck of decks"
        :key="deck.name"
        :to="{ name: DECKS_ROUTE_NAME, query: { deck: deck.name } }"
      >
        <AppLabel class="deck-label">{{ deckLabel(deck) }}</AppLabel>
      </RouterLink>

      <CardRetrievabilityLabel
        :r="retrievability.get('kanji-write')"
        label="書"
      />

      <CardRetrievabilityLabel
        :r="retrievability.get('kanji-read')"
        label="読"
      />
    </aside>

    <ul
      v-if="kanji.meanings?.length > 1"
      v-show="!hideMeaning"
      class="additional-meanings"
    >
      <li
        v-for="meaning of kanji.meanings.slice(1)"
        :key="meaning"
        class="meaning"
      >
        {{ meaning }}
      </li>
    </ul>

    <nav v-if="$slots.actions" class="actions">
      <slot name="actions" />
    </nav>
  </header>
</template>

<style scoped>
.kanji-title {
  column-gap: 1em;
  display: grid;
  grid-template:
    "literal meaning    labels     actions"
    "literal additional additional .      " 1fr
    / min-content auto 1fr auto;

  @media screen and (max-width: 75ch) {
    grid-template:
      "literal labels     actions"
      "literal meaning    .      "
      "literal additional .      "
      / min-content 1fr;
  }
}

.literal {
  font-size: 5em;
  font-weight: normal;
  grid-area: literal;
  line-height: 1em;
  margin: 0;
}

.main-meaning {
  font-size: 2em;
  grid-area: meaning;
  margin-block: 0;
}

.additional-meanings {
  column-gap: 1em;
  display: flex;
  flex-wrap: wrap;
  grid-area: additional;
  list-style: none;
  margin: 0;
  padding: 0;
}

.meaning {
  text-transform: capitalize;
}

.labels {
  align-content: start;
  align-items: stretch;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5ex;
  grid-area: labels;

  & .freq-label {
    background: var(--green);
    color: var(--background-strong);
  }

  & .deck-label {
    background: var(--blue);
  }

  & a {
    color: var(--background-strong);
    text-decoration: none;
  }
}

.actions {
  grid-area: actions;
}
</style>
