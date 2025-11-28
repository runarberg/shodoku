<script setup lang="ts">
import { computed } from "vue";

import { deckLabel } from "../helpers/decks.ts";
import { useCardRetrievability } from "../helpers/fsrs.ts";
import { DECKS_ROUTE_NAME } from "../router.ts";
import { useDecksContainingCard } from "../store/decks.ts";
import { KanaInfo } from "../types.ts";
import AppLabel from "./AppLabel.vue";
import CardRetrievabilityLabel from "./CardRetrievabilityLabel.vue";
import KanaRelated from "./KanaRelated.vue";

const props = withDefaults(
  defineProps<{
    kana: string;
    kanaInfo: KanaInfo | null;
    hideKana?: boolean;
    hideRomaji?: boolean;
    actions?: "explore" | "review";
  }>(),
  {
    hideLiteral: false,
    hideMeaning: false,
    actions: "explore",
  },
);

const cardId = computed(() => {
  const { kana } = props;

  // Yoon has a card for the small kana.
  return kana.codePointAt(kana.length === 2 ? 1 : 0);
});

const decks = useDecksContainingCard(cardId);
const retrievability = useCardRetrievability(cardId, [
  "kana-write",
  "kana-read",
]);
</script>

<template>
  <header class="kana-title">
    <h2 class="literal">
      <span v-if="!hideKana" lang="ja">{{ kana }}</span>
    </h2>

    <strong v-if="!hideRomaji" class="base-reading">
      {{ kanaInfo?.reading }}
    </strong>

    <aside class="labels">
      <AppLabel v-for="deck of decks" :key="deck.name" class="deck-label">
        <RouterLink
          :to="{ name: DECKS_ROUTE_NAME, query: { deck: deck.name } }"
        >
          {{ deckLabel(deck) }}
        </RouterLink>
      </AppLabel>

      <CardRetrievabilityLabel
        :r="retrievability.get('kana-write')"
        label="書"
      />

      <CardRetrievabilityLabel
        :r="retrievability.get('kana-read')"
        label="読"
      />
    </aside>

    <nav v-if="$slots.actions" class="actions">
      <slot name="actions" />
    </nav>

    <KanaRelated
      v-if="kanaInfo"
      :kana="kanaInfo"
      class="related"
      :data-blur="hideKana || hideRomaji ? true : null"
    />
  </header>
</template>

<style scoped>
.kana-title {
  column-gap: 1em;
  display: grid;
  grid-template:
    "literal labels  actions"
    "literal reading reading"
    "related related related"
    / min-content 1fr auto;
}

.literal {
  font-size: 5em;
  font-weight: normal;
  grid-area: literal;
  line-height: 1em;
  margin: 0;
}

.base-reading {
  align-self: end;
  font-size: 3em;
  font-weight: bold;
  grid-area: reading;
  text-transform: uppercase;
}

.labels {
  align-content: start;
  align-items: stretch;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5ex;
  grid-area: labels;

  & .deck-label {
    background: var(--blue);
    color: var(--background-strong);
  }
}

.actions {
  grid-area: actions;
}

.related {
  grid-area: related;

  &[data-blur] {
    filter: blur(3.5px);
  }
}
</style>
