<script setup lang="ts">
import { onMounted, reactive, toRaw } from "vue";
import { pipe } from "yta";
import { map, reduce } from "yta/async";

import { createDeck } from "../db/decks.ts";
import { db } from "../db/index.ts";
import { Deck } from "../types.ts";
import CustomDeckForm from "./CustomDeckForm.vue";

const emit = defineEmits<{
  cancel: [];
  success: [deck: Deck];
}>();

type Model = {
  label: string;
  priority: number;
  cards: number[];
};

const model = reactive<Model>({
  label: "",
  priority: 1,
  cards: [],
});

async function setDefaultPriority() {
  const customDeckCardCount = await pipe(
    (await db).transaction("decks").store.index("category").iterate("custom"),
    map((cursor) => cursor.value.cards.length),
    reduce((sum, length) => sum + length, 0),
  );

  if (customDeckCardCount) {
    model.priority = Math.ceil(customDeckCardCount / 12);
  }
}

async function handleSubmit() {
  const deck = await createDeck({
    category: "custom",
    label: model.label,
    priority: model.priority,
    cards: toRaw(model.cards),
  });

  emit("success", deck);
}

onMounted(() => {
  setDefaultPriority();
});
</script>

<template>
  <CustomDeckForm
    v-model:cards="model.cards"
    v-model:label="model.label"
    v-model:priority="model.priority"
    confirm-icon="plus"
    confirm-label="Create"
    @submit="handleSubmit"
    @reset="$emit('cancel')"
  />
</template>
