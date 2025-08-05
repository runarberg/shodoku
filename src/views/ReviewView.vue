<script setup lang="ts">
import { RecordLogItem } from "ts-fsrs";
import { computed, ref, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";

import AppLoading from "../components/AppLoading.vue";
import KanjiReview from "../components/KanjiReview.vue";
import ReviewRemainCount from "../components/ReviewRemainCount.vue";
import { reviewSummaryRoute } from "../router.ts";
import useReviewsStore from "../store/reviews.ts";
import { CardProgress, isCardType, Optional } from "../types.ts";

const el = ref<HTMLElement | null>(null);
const route = useRoute();
const router = useRouter();

const reviewsStore = useReviewsStore();

const currentCard = computed<Optional<CardProgress, "fsrs"> | null>(() => {
  const { kanji, "card-type": cardType } = route.query;

  if (typeof kanji !== "string" || typeof cardType !== "string") {
    return null;
  }

  const cardId = kanji.codePointAt(0);

  if (!cardId || !isCardType(cardType)) {
    return null;
  }

  const found = reviewsStore.queue.find(
    (other) => other.cardId === cardId && other.cardType === cardType,
  );

  return found ?? { cardId, cardType };
});

const isRating = computed(() => "rating" in route.query);
const loading = computed(() => !currentCard.value && reviewsStore.refreshing);

reviewsStore.refreshQueues();

watchEffect(() => {
  if (reviewsStore.queue.length === 0 && !reviewsStore.refreshing) {
    router.replace(reviewSummaryRoute);
  }
});

watchEffect(() => {
  if (currentCard.value) {
    return;
  }

  const [nextCard] = reviewsStore.queue;

  if (nextCard) {
    router.replace({
      query: {
        kanji: String.fromCodePoint(nextCard.cardId),
        "card-type": nextCard.cardType,
        rating: undefined,
      },
    });
  }
});

type HandleRateParams = {
  progress: CardProgress;
  next: RecordLogItem;
};

function handleRate({ progress, next }: HandleRateParams) {
  reviewsStore.rateCard(progress, next);

  const [nextCard] = reviewsStore.queue;
  if (nextCard) {
    router.replace({
      query: {
        kanji: String.fromCodePoint(nextCard.cardId),
        "card-type": nextCard.cardType,
        rating: undefined,
      },
    });
    el.value?.scrollIntoView({ behavior: "instant", block: "start" });
  } else {
    router.replace(reviewSummaryRoute);
  }
}
</script>

<template>
  <article ref="el">
    <header class="header">
      <strong class="title">
        <template v-if="currentCard">
          <template v-if="currentCard.cardType === 'kanji-read'">
            Reading
          </template>
          <template v-else>Writing</template>
          Review
        </template>
      </strong>

      <ReviewRemainCount class="counts" />
    </header>

    <section v-if="loading" class="loading">
      <p>Loading next card…</p>
      <AppLoading class="loading-icon" />
    </section>

    <KanjiReview
      v-else-if="currentCard"
      :card="currentCard"
      :is-rating="isRating"
      @answer="$router.replace({ query: { ...$route.query, rating: '' } })"
      @rate="handleRate($event)"
    />
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

.loading {
  text-align: center;

  & .loading-icon {
    color: var(--accent-color);
    font-size: 50cqmin;
    opacity: 0.5;
  }
}

.counts {
  margin-inline-start: auto;
}
</style>
