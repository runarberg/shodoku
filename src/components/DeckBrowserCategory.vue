<script setup lang="ts">
import { computed, ref, useId } from "vue";

import { db } from "../db/index.ts";
import { browserAddCategory, browserRemoveCategory } from "../db/decks.ts";
import { useLiveQuery } from "../helpers/db.ts";
import { Deck, DeckTemplate } from "../types.ts";

import AppButton from "./AppButton.vue";
import DeckBrowserItem from "./DeckBrowserItem.vue";
import DeckAddButton from "./DeckAddButton.vue";

const props = defineProps<{
  title: string;
  category: string;
  deckTemplates: DeckTemplate[];
}>();

const expanded = ref(false);
const titleId = useId();

const { value: storedDeckCount } = useLiveQuery(
  computed(() => {
    const { category } = props;

    return () => db.decks.where({ category }).count();
  })
);

const added = computed(
  () => (storedDeckCount.value ?? 0) >= props.deckTemplates.length
);

async function addDeckCategory() {
  try {
    await browserAddCategory(props.category, props.deckTemplates);
  } catch (error) {
    console.error(error);
  }
}

async function removeDeckCategory() {
  try {
    await browserRemoveCategory(props.category);
  } catch (error) {
    console.error(error);
  }
}

function fromDeckTemplate({
  name,
  label,
  priority,
}: DeckTemplate): Omit<Deck, "cards"> {
  return {
    name,
    label,
    priority,
    category: props.category,
  };
}
</script>

<template>
  <article :aria-labelledby="titleId">
    <div class="controls">
      <strong :id="titleId" class="title">{{ title }}</strong>
      <DeckAddButton
        :added="added"
        @add="addDeckCategory"
        @remove="removeDeckCategory"
      />
    </div>

    <AppButton
      class="expand-button"
      :aria-pressed="expanded"
      @click="expanded = !expanded"
    >
      <template v-if="expanded">Hide </template>
      <template v-else>Show </template>
      ({{ deckTemplates.length }} decks)
    </AppButton>

    <ol v-if="expanded" class="deck-list">
      <li v-for="deck of deckTemplates" :key="deck.name">
        <DeckBrowserItem
          :deck="fromDeckTemplate(deck)"
          :contentPath="deck.content"
        />
      </li>
    </ol>
  </article>
</template>

<style scoped>
.controls {
  align-items: center;
  column-gap: 1ex;
  display: flex;
}

.title {
  font-size: 1.5em;
}

.expand-button {
  background: none;
  font-size: 0.75em;
  border: none;
  padding: 0;
}

.deck-list {
  list-style: none;
  margin-block: 1ex;
  padding: 0;

  & > li {
    margin-block-start: 1ex;
  }
}
</style>
