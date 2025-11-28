<script setup lang="ts">
import { computed, ref, useId } from "vue";

import { createDeck, removeDeck } from "../db/decks.ts";
import { db } from "../db/index.ts";
import { useLiveQuery } from "../helpers/db.ts";
import { kanaDeckTemplates } from "../helpers/decks.ts";
import {
  HIRAGANA_DAKUTEN_TABLE_DATA,
  HIRAGANA_TABLE_DATA,
  HIRAGANA_YOON_TABLE_DATA,
  KATAKANA_DAKUTEN_TABLE_DATA,
  KATAKANA_TABLE_DATA,
  KATAKANA_YOON_TABLE_DATA,
} from "../helpers/kana.ts";
import { Deck } from "../types.ts";
import AppButton from "./AppButton.vue";
import DeckAcativateButton from "./DeckActivateButton.vue";
import DeckBrowserKanaItem from "./DeckBrowserKanaItem.vue";
import KanaTable from "./KanaTable.vue";

// const creating = ref(false);
const expanded = ref(false);
const titleId = useId();

const toggling = ref(false);

const { result: storedDecks } = useLiveQuery(
  computed(() => {
    return async () => {
      const map = new Map<string, Deck>();

      const items = (await db)
        .transaction("decks")
        .store.index("category+priority")
        .iterate(
          IDBKeyRange.bound(
            ["kana", Number.NEGATIVE_INFINITY],
            ["kana", Number.POSITIVE_INFINITY],
            true,
            true,
          ),
        );

      for await (const item of items) {
        map.set(item.primaryKey, item.value);
      }

      return map;
    };
  }),
  new Map<string, Deck>(),
);

const availableDeckCount = Object.keys(kanaDeckTemplates).length;

const isCategoryActive = computed(
  () => storedDecks.value.size === availableDeckCount,
);

async function activate() {
  toggling.value = true;

  const decks = storedDecks.value;

  try {
    for (const template of Object.values(kanaDeckTemplates)) {
      if (!decks.has(template.name)) {
        await createDeck(template);
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  } finally {
    toggling.value = false;
  }
}

async function deactivate() {
  toggling.value = true;

  try {
    for (const name of storedDecks.value.keys()) {
      await removeDeck(name);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  } finally {
    toggling.value = false;
  }
}
</script>

<template>
  <article :aria-labelledby="titleId">
    <div class="controls">
      <strong :id="titleId" class="title">Kana</strong>

      <DeckAcativateButton
        :toggling="toggling"
        :is-active="isCategoryActive"
        @activate="activate"
        @deactivate="deactivate"
      />
    </div>

    <AppButton
      class="expand-button"
      :aria-pressed="expanded"
      @click="expanded = !expanded"
    >
      <template v-if="expanded">Hide </template>
      <template v-else>Show </template>
      ({{ availableDeckCount }} decks)
    </AppButton>

    <ol v-if="expanded" class="deck-list">
      <li>
        <DeckBrowserKanaItem
          :template="kanaDeckTemplates.hiragana"
          :toggling-category="toggling"
          :is-active="storedDecks.has('hiragana')"
        >
          <KanaTable class="kana-table" v-bind="HIRAGANA_TABLE_DATA" />
        </DeckBrowserKanaItem>
      </li>

      <li>
        <DeckBrowserKanaItem
          :template="kanaDeckTemplates.katakana"
          :toggling-category="toggling"
          :is-active="storedDecks.has('katakana')"
        >
          <KanaTable class="kana-table" v-bind="KATAKANA_TABLE_DATA" />
        </DeckBrowserKanaItem>
      </li>

      <li>
        <DeckBrowserKanaItem
          :template="kanaDeckTemplates.hiraganaDakuten"
          :toggling-category="toggling"
          :is-active="storedDecks.has(kanaDeckTemplates.hiraganaDakuten.name)"
        >
          <KanaTable class="kana-table" v-bind="HIRAGANA_DAKUTEN_TABLE_DATA" />
        </DeckBrowserKanaItem>
      </li>

      <li>
        <DeckBrowserKanaItem
          :template="kanaDeckTemplates.hiraganaYoon"
          :toggling-category="toggling"
          :is-active="storedDecks.has(kanaDeckTemplates.hiraganaYoon.name)"
        >
          <KanaTable class="kana-table" v-bind="HIRAGANA_YOON_TABLE_DATA" />
        </DeckBrowserKanaItem>
      </li>

      <li>
        <DeckBrowserKanaItem
          :template="kanaDeckTemplates.katakanaDakuten"
          :toggling-category="toggling"
          :is-active="storedDecks.has(kanaDeckTemplates.katakanaDakuten.name)"
        >
          <KanaTable class="kana-table" v-bind="KATAKANA_DAKUTEN_TABLE_DATA" />
        </DeckBrowserKanaItem>
      </li>

      <li>
        <DeckBrowserKanaItem
          :template="kanaDeckTemplates.katakanaYoon"
          :toggling-category="toggling"
          :is-active="storedDecks.has(kanaDeckTemplates.katakanaYoon.name)"
        >
          <KanaTable class="kana-table" v-bind="KATAKANA_YOON_TABLE_DATA" />
        </DeckBrowserKanaItem>
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
    margin-block-start: 1em;
  }
}
</style>
