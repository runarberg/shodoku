<script setup lang="ts">
import { computed, ref, useId, watch } from "vue";

import {
  activateDeck,
  createDeck,
  deactivateDeck,
  removeDeck,
} from "../db/decks.ts";
import { kanjiRoute } from "../router.ts";
import { Deck, DeckTemplate } from "../types.ts";

import AppButton from "./AppButton.vue";
import CustomDeckEdit from "./CustomDeckEdit.vue";
import DeckActivateButton from "./DeckActivateButton.vue";

type Props = (
  | {
      deck: Deck;
      template?: null;
      category?: null;
    }
  | {
      deck?: null;
      template: DeckTemplate;
      category: string;
    }
) & {
  togglingCategory?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  togglingCategory: false,
});

const toggling = ref(false);
const editing = ref(false);
const labelId = useId();
const kanjiList = ref<string[] | null>(null);

const isActive = computed(() => props.deck?.active);

async function activate() {
  toggling.value = true;

  try {
    if (props.deck) {
      await activateDeck(props.deck.name);
    } else {
      await createDeck({
        name: props.template.name,
        label: props.template.label,
        priority: props.template.priority,
        category: props.category,
        cards:
          kanjiList.value?.map((kanji) => kanji.codePointAt(0) ?? NaN) ?? [],
      });
    }
  } catch (error) {
    console.error(error);
  } finally {
    toggling.value = false;
  }
}

async function deactivate() {
  if (!props.deck) {
    return;
  }

  toggling.value = true;

  try {
    await deactivateDeck(props.deck.name);
  } catch (error) {
    console.error(error);
  } finally {
    toggling.value = false;
  }
}

watch(
  () => props.template?.content,
  async (path) => {
    if (!path) {
      kanjiList.value = null;
      return;
    }

    const response = await fetch(path);
    const text = await response.text();

    kanjiList.value = text.split("\n").filter((char) => char);
  },
  { immediate: true }
);
</script>

<template>
  <CustomDeckEdit
    v-if="editing && deck"
    :deck="deck"
    @cancel="editing = false"
    @success="editing = false"
  />

  <article v-else :aria-labelledby="labelId">
    <div class="controls">
      <strong :id="labelId">{{ deck?.label ?? template?.label }}</strong>
      <DeckActivateButton
        :toggling="toggling || togglingCategory"
        :is-active="isActive"
        @activate="activate"
        @deactivate="deactivate"
      />

      <AppButton
        v-if="deck?.active || deck?.category === 'custom'"
        class="edit-button"
        @click="editing = true"
      >
        Edit
      </AppButton>
      <AppButton
        v-else-if="deck && !deck.active && deck.category !== 'custom'"
        class="edit-button"
        @click="removeDeck(deck.name)"
      >
        Reset
      </AppButton>

      <AppButton
        v-if="deck?.category === 'custom'"
        class="delete-button"
        @click="removeDeck(deck.name)"
      >
        Delete
      </AppButton>
    </div>

    <ol class="kanji-list">
      <template v-if="deck">
        <li v-for="codePoint of deck.cards" :key="codePoint" class="kanji">
          <RouterLink :to="kanjiRoute(String.fromCodePoint(codePoint))">
            {{ String.fromCodePoint(codePoint) }}
          </RouterLink>
        </li>
      </template>
      <template v-else-if="kanjiList">
        <li v-for="kanji of kanjiList" :key="kanji" class="kanji">
          <RouterLink :to="kanjiRoute(kanji)">{{ kanji }}</RouterLink>
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

  & .edit-button,
  & .delete-button {
    background: none;
    border: none;
    font-size: 0.8em;
    padding: 0.2ex;
  }
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
