<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { pipe } from "yta";
import { groupBy } from "yta/sync";

import { createDeck } from "../db/decks.ts";
import { categoryLabel } from "../helpers/decks.ts";
import { useDecks } from "../store/decks.ts";
import { KanjiInfo } from "../types.ts";
import AppButton from "./AppButton.vue";
import AppDialog from "./AppDialog.vue";
import AppInput from "./AppInput.vue";
import AppNumberInput from "./AppNumberInput.vue";
import KanjiManageDecksDeckItem from "./KanjiManageDecksDeckItem.vue";

const props = defineProps<{
  kanji: KanjiInfo;
}>();

const dialog = ref<InstanceType<typeof AppDialog> | null>(null);
const allDecks = useDecks();
const createNewExpanded = ref(false);

const createDeckModel = reactive({
  label: "",
  priority: 1,
});

const categories = computed(() =>
  pipe(
    allDecks.value ?? [],
    groupBy((deck) => deck.category),
  ),
);

async function show() {
  createNewExpanded.value = false;
  createDeckModel.label = "";
  createDeckModel.priority = 1;

  dialog.value?.show();
}

function maybeCreateDeck() {
  if (!createNewExpanded.value) {
    return;
  }

  createDeck({
    label: createDeckModel.label,
    priority: createDeckModel.priority,
    cards: [props.kanji.codepoint],
    cardTypes: ["kanji-write", "kanji-read"],
  });
}

defineExpose({
  show,
});
</script>

<template>
  <AppDialog
    ref="dialog"
    :title="` ${kanji.literal}: Manage Decks`"
    :cancel-label="createNewExpanded ? 'Cancel' : null"
    :confirm-label="createNewExpanded ? 'Cretate Deck' : 'Close'"
    @confirm="maybeCreateDeck"
  >
    <p>
      Select a decks to add/remove <strong>{{ kanji.literal }}</strong> to/from.
    </p>

    <template #form>
      <ul class="list">
        <template v-for="[category, decks] of categories" :key="category">
          <li v-if="category !== 'custom'">
            <details
              class="category-details"
              :open="decks.some(({ cards }) => cards.includes(kanji.codepoint))"
            >
              <summary class="category-summary">
                {{ categoryLabel(category) }}
              </summary>

              <ul class="list">
                <li v-for="deck of decks" :key="deck.name">
                  <KanjiManageDecksDeckItem :kanji="kanji" :deck="deck" />
                </li>
              </ul>
            </details>
          </li>
        </template>

        <li v-for="deck of categories.get('custom') ?? []" :key="deck.name">
          <KanjiManageDecksDeckItem :kanji="kanji" :deck="deck" />
        </li>
      </ul>

      <div class="create-new-fields" :class="{ expanded: createNewExpanded }">
        <AppButton
          v-if="!createNewExpanded"
          class="create-new-expand-button"
          prefix-icon="plus"
          inline
          @click="createNewExpanded = true"
        >
          Create New
        </AppButton>

        <template v-else>
          <AppInput
            v-model="createDeckModel.label"
            class="name-field"
            label="Deck Name"
            required
          />

          <AppNumberInput
            v-model="createDeckModel.priority"
            class="priority-field"
            label="Priority"
            min="1"
            required
          />
        </template>
      </div>
    </template>
  </AppDialog>
</template>

<style scoped>
.list {
  list-style: none;
  margin: 0;
  padding: 0;

  .category-details & {
    border-inline-start: 1px solid var(--accent-color);
    margin-inline-start: 0.33ch;
    padding-inline-start: 1em;
  }
}

.category-details {
  margin-block-end: 0.5em;

  & summary {
    cursor: pointer;
  }
}

.create-new-fields {
  margin-block-start: 1em;

  &.expanded {
    column-gap: 1ex;
    display: grid;
    grid-template-columns: 3fr 1fr;

    @media screen and (max-width: 60ch) {
      display: flex;
      flex-direction: column;
      row-gap: 1ex;
    }
  }
}
</style>
