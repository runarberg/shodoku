<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { RecordLogItem } from "ts-fsrs";

import KanjiReview from "../components/KanjiReview.vue";
import ReviewRemainCount from "../components/ReviewRemainCount.vue";
import ReviewSummary from "../components/ReviewSummary.vue";
import { rateCard } from "../db/cards.ts";
import { liveQueryBroadcaster } from "../helpers/channels.ts";
import { useCardProgress } from "../store/cards.ts";
import { CardProgress, CardType, isCardType } from "../types.ts";

const route = useRoute();
const router = useRouter();

const answered = computed<{ cardId: number; cardType: CardType } | null>(() => {
  const { kanji, "card-type": cardType } = route.query;

  if (typeof kanji !== "string" || typeof cardType !== "string") {
    return null;
  }

  const cardId = kanji.codePointAt(0);

  if (!cardId || !isCardType(cardType)) {
    return null;
  }

  return { cardId, cardType };
});

const lastReview = ref<{ cardId: number; cardType: CardType } | null>(null);
const { result: currentCard, loading: loadingProgress } =
  useCardProgress(answered);

const initialLoading = ref(true);
watch(loadingProgress, (isProgressLoading) => {
  if (!isProgressLoading) {
    initialLoading.value = false;
  }
});

const isLoadingNextCard = computed(() => {
  if (initialLoading.value) {
    return true;
  }

  if (!currentCard.value || !lastReview.value) {
    return false;
  }

  if (answered.value?.cardId === currentCard.value.cardId) {
    return false;
  }

  return (
    loadingProgress.value &&
    currentCard.value.cardId === lastReview.value.cardId &&
    currentCard.value.cardType === currentCard.value.cardType
  );
});

async function handleRate(progress: CardProgress, next: RecordLogItem) {
  try {
    lastReview.value = { cardId: progress.cardId, cardType: progress.cardType };

    await rateCard(progress.cardId, progress.cardType, next);
    liveQueryBroadcaster.postMessage("card-review");
    router.replace({ query: { kanji: undefined, "card-type": undefined } });
  } catch (error) {
    console.error(error);
  }
}
</script>

<template>
  <article>
    <header class="header">
      <strong class="title">
        <template v-if="currentCard">
          <template v-if="currentCard.cardType === 'kanji-read'">
            Reading
          </template>
          <template v-else>Writing</template>
          Review
        </template>
        <template v-else-if="!initialLoading">Review Summary</template>
      </strong>

      <ReviewRemainCount class="counts" />
    </header>

    <p v-if="isLoadingNextCard">Loading next card...</p>

    <KanjiReview
      v-else-if="currentCard"
      :progress="currentCard"
      :answered="answered != null"
      @answer="
        $router.replace({
          query: {
            kanji: String.fromCodePoint(currentCard.cardId),
            'card-type': currentCard.cardType,
          },
        })
      "
      @rate="handleRate(currentCard, $event)"
    />

    <ReviewSummary v-else />
  </article>
</template>

<style scoped>
.header {
  display: flex;
  margin-block-end: 1em;

  & .title {
    font-size: 1.5em;
  }
}

.counts {
  margin-inline-start: auto;
}
</style>
