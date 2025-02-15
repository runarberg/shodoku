<script setup lang="ts">
import { computed } from "vue";

import { KanjiInfo } from "../types";
import { useLiveQuery } from "../helpers/db";
import { db } from "../db";
import { deckLabel } from "../helpers/decks";
import { DECKS_ROUTE_NAME } from "../router";
import { useKanjiRetrievability } from "../helpers/fsrs";
import { formatPercent } from "../helpers/formats";

const props = defineProps<{
  kanji: KanjiInfo;
  hideLiteral?: boolean;
  hideMeaning?: boolean;
}>();

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
});

const { result: decks } = useLiveQuery(
  computed(() => {
    const cardId = props.kanji.codepoint;

    return async () =>
      (await db)
        .transaction("decks")
        .store.index("cards")
        .getAll(IDBKeyRange.only(cardId));
  })
);

const retrievability = useKanjiRetrievability(() => props.kanji.codepoint);

function rGrade(p: number): "good" | "fair" | "poor" {
  if (p > 0.9) {
    return "good";
  }

  if (p > 0.7) {
    return "fair";
  }

  return "poor";
}
</script>

<template>
  <header class="kanji-title">
    <h2 class="literal" lang="ja" v-show="!hideLiteral">
      {{ kanji.literal }}
    </h2>

    <p class="main-meaning meaning" v-show="!hideMeaning">
      <strong>{{ kanji.meanings?.at(0) }}</strong>
    </p>

    <aside class="labels">
      <span
        v-if="freq && !decks?.some(({ name }) => name === `news-top-${freq}`)"
        class="label freq"
      >
        Top {{ freq }}
      </span>
      <template v-if="decks">
        <RouterLink
          :to="{ name: DECKS_ROUTE_NAME, query: { deck: deck.name } }"
          v-for="deck of decks"
          :key="deck.name"
          class="label deck"
        >
          {{ deckLabel(deck) }}
        </RouterLink>
      </template>
      <span
        v-if="retrievability?.write"
        class="label retrievability"
        title="Writing Retrievability"
        :data-r="rGrade(retrievability.write)"
      >
        書 {{ formatPercent(retrievability.write) }}
      </span>

      <span
        v-if="retrievability?.read"
        class="label retrievability"
        title="Reading Retrievability"
        :data-r="rGrade(retrievability.read)"
      >
        読 {{ formatPercent(retrievability.read) }}
      </span>
    </aside>

    <ul
      v-if="kanji.meanings?.length > 1"
      v-show="!hideMeaning"
      class="additional-meanings"
    >
      <li v-for="meaning of kanji.meanings.slice(1)" class="meaning">
        {{ meaning }}
      </li>
    </ul>
  </header>
</template>

<style scoped>
.kanji-title {
  column-gap: 1em;
  display: grid;
  grid-template:
    "literal meaning labels"
    "literal additional additional" 1fr
    / min-content auto 1fr;

  @media screen and (max-width: 75ch) {
    grid-template:
      "literal labels"
      "literal meaning"
      "literal additional"
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
  align-items: start;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5ex;
  grid-area: labels;

  & .label {
    border-radius: 1ex;
    font-size: 0.6em;
    font-weight: 600;
    padding: 0.5ex 1ex;
  }

  & .freq {
    background: var(--green);
    color: var(--background-strong);
  }

  & .deck {
    background: var(--blue);
    color: var(--background-strong);
    text-decoration: none;
  }

  & .retrievability {
    color: var(--background-strong);

    &[data-r="good"] {
      background: var(--green);
    }

    &[data-r="fair"] {
      background: var(--gold);
    }

    &[data-r="poor"] {
      background: var(--orange);
    }
  }
}
</style>
