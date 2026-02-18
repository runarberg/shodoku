<script setup lang="ts">
import { reactive, toRaw } from "vue";

import { editDeck } from "../db/decks.ts";
import { Deck } from "../types.ts";
import CustomDeckForm from "./CustomDeckForm.vue";

const props = defineProps<{
  deck: Deck;
}>();

const emit = defineEmits<{
  cancel: [];
  success: [];
}>();

const model = reactive({
  label: props.deck.label,
  priority: props.deck.priority,
  cards: props.deck.cards,
});

async function handleSubmit() {
  const deck = toRaw(props.deck);

  await editDeck({
    ...deck,
    label: model.label,
    priority: model.priority,
    cards: toRaw(model.cards),
  });

  emit("success");
}
</script>

<template>
  <CustomDeckForm
    v-model:cards="model.cards"
    v-model:label="model.label"
    v-model:priority="model.priority"
    confirm-label="Update"
    :label-field-disabled="props.deck.category !== 'custom'"
    :priority-field-disabled="props.deck.category !== 'custom'"
    @submit="handleSubmit"
    @reset="$emit('cancel')"
  />
</template>
