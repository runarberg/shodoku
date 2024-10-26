<script setup lang="ts">
import { computed, ref, useId, watch } from "vue";

import { browserAddDeck, browserRemoveDeck } from "../db/decks.ts";
import { kanjiRoute } from "../router.ts";
import { useDeck } from "../store/decks.ts";
import { Deck } from "../types.ts";

import DeckAddButton from "./DeckAddButton.vue";

const props = defineProps<{
  deck: Omit<Deck, "cards">;
  contentPath: string;
  addingCategory?: boolean;
}>();

const adding = ref(false);
const labelId = useId();
const kanjiList = ref<string[] | null>(null);

async function addDeck() {
  if (!kanjiList.value) {
    return;
  }

  const cards = kanjiList.value.map((kanji) => kanji.codePointAt(0) ?? NaN);
  adding.value = true;

  try {
    await browserAddDeck({ ...props.deck, cards });
  } catch (error) {
    console.error(error);
  } finally {
    adding.value = false;
  }
}

async function removeDeck() {
  adding.value = true;

  try {
    await browserRemoveDeck(props.deck.name);
  } catch (error) {
    console.error(error);
  } finally {
    adding.value = false;
  }
}

const storedDeck = useDeck(() => props.deck.name);
const hasAddedDeck = computed(() => storedDeck.value != null);

watch(
  () => props.contentPath,
  async (path) => {
    const response = await fetch(path);
    const text = await response.text();

    kanjiList.value = text.split("\n").filter((char) => char);
  },
  { immediate: true }
);
</script>

<template>
  <article :aria-labelledby="labelId">
    <div class="controls">
      <strong :id="labelId">{{ deck.label }}</strong>
      <DeckAddButton
        :adding="adding || addingCategory"
        :added="hasAddedDeck"
        @add="addDeck"
        @remove="removeDeck"
      />
    </div>

    <ol class="kanji-list">
      <li v-for="kanji of kanjiList" :key="kanji" class="kanji">
        <RouterLink :to="kanjiRoute(kanji)">{{ kanji }}</RouterLink>
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

.kanji-list {
  display: flex;
  flex-wrap: wrap;
  column-gap: 1ex;
  list-style: none;
  margin: 0;
}

.kanji {
  font-size: 1.2em;

  & a {
    color: inherit;
    text-decoration: none;
  }
}
</style>
