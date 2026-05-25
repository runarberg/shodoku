<script setup lang="ts">
import { computed, reactive, ref, useTemplateRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import AppButton from "../components/AppButton.vue";
import PracticeAdvanceButtons from "../components/PracticeAdvanceButtons.vue";
import PracticeCardKana from "../components/PracticeCardKana.vue";
import PracticeCardKanji from "../components/PracticeCardKanji.vue";
import { useDeckOrTemplate } from "../store/decks.ts";
import { type CardType } from "../types.ts";

const el = useTemplateRef("el");
const route = useRoute();
const router = useRouter();

const deckName = computed(() => {
  if (typeof route.params.deckName !== "string") {
    return null;
  }

  return route.params.deckName;
});

const showAnswer = ref(false);
const { deck, loading } = useDeckOrTemplate(deckName);
const finished = reactive<number[]>([]);
const cards = computed(
  () => deck.value?.cards.filter((id) => !finished.includes(id)) ?? [],
);

function randomCardType(): CardType | null {
  if (!deck.value) {
    return null;
  }

  const { cardTypes } = deck.value;
  return cardTypes.at(Math.floor(Math.random() * cardTypes.length)) ?? null;
}

const cardId = computed(() =>
  cards.value.at(Math.floor(Math.random() * cards.value.length)),
);

const card = computed<{ type: CardType; id: number } | null>(() => {
  const cardType = randomCardType();

  if (!cardType || !cardId.value) {
    return null;
  }

  return { type: cardType, id: cardId.value };
});

watch(card, (cardValue) => {
  showAnswer.value = false;

  if (cardValue) {
    el.value?.scrollIntoView({ behavior: "instant", block: "start" });
  }
});

watch([deck, finished], ([deckValue, finishedValue]) => {
  if (!deckValue || deckValue.cards.length === 0) {
    return;
  }

  if (finishedValue.length === deckValue.cards.length) {
    router.back();
  }
});
</script>

<template>
  <article ref="el" class="practice-deck-view">
    <header class="header">
      <strong class="title">
        <template v-if="card?.type.endsWith('-read')"> Reading </template>
        <template v-else-if="card?.type.endsWith('-write')"> Writing </template>
        Practice
      </strong>

      <AppButton
        class="back-button"
        prefix-icon="arrow-left"
        inline
        @click="$router.back()"
      >
        Back
      </AppButton>
    </header>

    <template v-if="loading">Loading</template>
    <template v-else-if="!deck || deck.cards.length === 0">
      <p>Empty deck.</p>
      <AppButton @click="$router.back()">Back</AppButton>
    </template>

    <template v-if="card">
      <PracticeCardKanji
        v-if="card.type === 'kanji-read' || card.type === 'kanji-write'"
        v-model:show-answer="showAnswer"
        :card-id="card.id"
        :card-type="card.type"
      >
        <template #buttons>
          <PracticeAdvanceButtons
            v-model:show-answer="showAnswer"
            :card-type="card.type"
            @advance="finished.push(card.id)"
          />
        </template>
      </PracticeCardKanji>
      <PracticeCardKana
        v-else
        v-model:show-answer="showAnswer"
        :card-id="card.id"
        :card-type="card.type"
      >
        <template #buttons>
          <PracticeAdvanceButtons
            v-model:show-answer="showAnswer"
            :card-type="card.type"
            @advance="finished.push(card.id)"
          />
        </template>
      </PracticeCardKana>
    </template>
  </article>
</template>

<style scoped>
.practice-deck-view {
  min-block-size: calc(100vh - 4em);
}

.header {
  display: flex;
  margin-block-end: 1em;

  & .title {
    font-size: 1.5em;
  }

  & .back-button {
    margin-inline-start: auto;
  }
}
</style>
