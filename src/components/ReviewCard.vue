<script setup lang="ts">
import { asyncComputed } from "@vueuse/core";
import { RecordLogItem, State } from "ts-fsrs";
import { computed } from "vue";

import { db } from "../db/index.ts";
import { CardProgress, Optional } from "../types.ts";
import ReviewCardKana from "./ReviewCardKana.vue";
import ReviewCardKanji from "./ReviewCardKanji.vue";

const props = defineProps<{
  card: Optional<CardProgress, "fsrs">;
  isRating?: boolean;
}>();

defineEmits<{
  answer: [];
  rate: [value: { progress: CardProgress; next: RecordLogItem }];
}>();

const progress = asyncComputed(async () => {
  const { cardId, cardType, fsrs } = props.card;

  if (fsrs) {
    return fsrs;
  }

  const card = await (await db).get("progress", [cardId, cardType]);

  return card?.fsrs;
}, props.card.fsrs);

const isNewCard = computed(() => progress.value?.state === State.New);
</script>

<template>
  <section v-if="progress">
    <component
      :is="card.cardType.startsWith('kana-') ? ReviewCardKana : ReviewCardKanji"
      :card-id="card.cardId"
      :progress="progress"
      :is-new="isNewCard"
      :is-rating="isRating"
      :mode="card.cardType.endsWith('-write') ? 'write' : 'read'"
      @answer="$emit('answer')"
      @rate="
        $emit('rate', {
          progress: { ...card, fsrs: progress },
          next: $event,
        })
      "
    />
  </section>
</template>
