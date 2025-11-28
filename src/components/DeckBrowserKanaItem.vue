<script lang="ts" setup>
import { ref } from "vue";

import { createDeck, removeDeck } from "../db/decks.ts";
import { KanaDeckTemplate } from "../helpers/decks.ts";
import DeckActivateButton from "./DeckActivateButton.vue";

const props = defineProps<{
  template: KanaDeckTemplate;
  togglingCategory?: boolean;
  isActive?: boolean;
}>();

const toggling = ref(false);

async function activate() {
  toggling.value = true;

  try {
    await createDeck(props.template);
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
    await removeDeck(props.template.name);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  } finally {
    toggling.value = false;
  }
}
</script>

<template>
  <article class="deck-browser-kana-deck-item">
    <header class="header">
      <strong class="kana-title">{{ template.label }}</strong>

      <DeckActivateButton
        :toggling="toggling || togglingCategory"
        :is-active="isActive"
        @activate="activate"
        @deactivate="deactivate"
      />
    </header>

    <div class="body">
      <slot />
    </div>
  </article>
</template>

<style scoped>
.header {
  align-items: center;
  column-gap: 1ex;
  display: flex;
}

.body {
  margin-inline-start: 2.5em;

  :slotted(& table) {
    inline-size: 100%;
  }
}
</style>
