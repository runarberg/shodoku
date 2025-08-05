<script setup lang="ts">
import { computed, ref, useId } from "vue";

import { activateDeckCategory, deactivateDeckCategory } from "../db/decks.ts";
import { db } from "../db/index.ts";
import { useLiveQuery } from "../helpers/db.ts";
import { Deck, DeckTemplate } from "../types.ts";
import AppButton from "./AppButton.vue";
import CustomDeckCreate from "./CustomDeckCreate.vue";
import DeckAcativateButton from "./DeckActivateButton.vue";
import DeckBrowserItem from "./DeckBrowserItem.vue";

const props = defineProps<{
  title: string;
  category: string;
  deckTemplates?: DeckTemplate[];
}>();

const creating = ref(false);
const expanded = ref(false);
const titleId = useId();

const { result: storedDecks } = useLiveQuery(
  computed(() => {
    const { category } = props;

    return async () => {
      const map = new Map<string, Deck>();

      const items = (await db)
        .transaction("decks")
        .store.index("category+priority")
        .iterate(
          IDBKeyRange.bound(
            [category, 0],
            [category, Number.POSITIVE_INFINITY],
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
);

const deckCount = computed(() => {
  if (props.deckTemplates) {
    return props.deckTemplates.length;
  }

  return storedDecks.value?.size ?? 0;
});

const activeDeckCount = computed(() => {
  if (!storedDecks.value) {
    return 0;
  }

  let sum = 0;
  for (const [, { active }] of storedDecks.value) {
    if (active) {
      sum += 1;
    }
  }

  return sum;
});

const toggling = ref(false);
const isActive = computed(() => {
  if (!props.deckTemplates) {
    return true;
  }

  return activeDeckCount.value >= props.deckTemplates.length;
});

async function activate(deckTemplates: DeckTemplate[]) {
  toggling.value = true;

  try {
    await activateDeckCategory(props.category, deckTemplates);
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
    await deactivateDeckCategory(props.category);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  } finally {
    toggling.value = false;
  }
}

function handleDeckCreated() {
  expanded.value = true;
  creating.value = false;
}
</script>

<template>
  <article :aria-labelledby="titleId">
    <div class="controls">
      <strong :id="titleId" class="title">{{ title }}</strong>

      <DeckAcativateButton
        v-if="deckTemplates"
        :toggling="toggling"
        :is-active="isActive"
        @activate="activate(deckTemplates)"
        @deactivate="deactivate"
      />

      <AppButton
        v-else-if="!creating"
        class="create-custom-button"
        prefix-icon="plus"
        @click="creating = true"
      >
        Create New
      </AppButton>
    </div>

    <AppButton
      v-if="deckCount > 0"
      class="expand-button"
      :aria-pressed="expanded"
      @click="expanded = !expanded"
    >
      <template v-if="expanded"> Hide </template>
      <template v-else> Show </template>
      ({{ deckCount }} decks)
    </AppButton>

    <CustomDeckCreate
      v-if="creating"
      class="custom-deck-create"
      @cancel="creating = false"
      @success="handleDeckCreated"
    />

    <ol v-if="expanded" class="deck-list">
      <template v-if="deckTemplates">
        <li v-for="template of deckTemplates" :key="template.name">
          <DeckBrowserItem
            :deck="storedDecks?.get(template.name)"
            :template="template"
            :category="category"
            :toggling-category="toggling"
          />
        </li>
      </template>
      <template v-else-if="storedDecks">
        <li v-for="[name, deck] of storedDecks" :key="name">
          <DeckBrowserItem :deck="deck" />
        </li>
      </template>
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

.create-custom-button {
  border-width: 2px;
  padding: 0.5ex;
  font-size: 0.8em;
}

.expand-button {
  background: none;
  font-size: 0.75em;
  border: none;
  padding: 0;
}

.custom-deck-create {
  margin-block: 1em;
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
