<script setup lang="ts">
import { RecordLogItem } from "ts-fsrs";
import { computed, ref, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";

import AppLoading from "../components/AppLoading.vue";
import ReviewCard from "../components/ReviewCard.vue";
import ReviewRemainCount from "../components/ReviewRemainCount.vue";
import { kanaRoute, kanjiRoute, reviewSummaryRoute } from "../router.ts";
import useReviewsStore from "../store/reviews.ts";
import { CardProgress, CardType, isCardType, Optional } from "../types.ts";

const el = ref<HTMLElement | null>(null);
const route = useRoute();
const router = useRouter();

const reviewsStore = useReviewsStore();

const cardType = computed<CardType | null>(() => {
  const { "card-type": queryValue } = route.query;

  if (typeof queryValue !== "string" || !isCardType(queryValue)) {
    return null;
  }

  return queryValue;
});

const cardId = computed(() => {
  const { "card-id": queryValue } = route.query;

  if (typeof queryValue !== "string") {
    return null;
  }

  const id = Number.parseInt(queryValue);

  if (!Number.isFinite(id)) {
    return null;
  }

  return id;
});

const currentCard = computed<Optional<CardProgress, "fsrs"> | null>(() => {
  if (!cardId.value || !cardType.value) {
    return null;
  }

  const found = reviewsStore.queue.find(
    (other) =>
      other.cardId === cardId.value && other.cardType === cardType.value,
  );

  return found ?? { cardId: cardId.value, cardType: cardType.value };
});

const isRating = computed(() => "rating" in route.query);
const loading = computed(() => !currentCard.value && reviewsStore.refreshing);

reviewsStore.refreshQueues();

watchEffect(() => {
  if (
    reviewsStore.queue.length === 0 &&
    !reviewsStore.refreshing &&
    !isRating.value &&
    !("singleton" in route.query)
  ) {
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
        "card-id": nextCard.cardId,
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

  if ("singleton" in route.query) {
    if (progress.cardType.startsWith("kanji-")) {
      router.replace(kanjiRoute(String.fromCodePoint(progress.cardId)));
    } else if (progress.cardType.startsWith("kana-")) {
      router.replace(kanaRoute(String.fromCodePoint(progress.cardId)));
    }
    return;
  }

  const [nextCard] = reviewsStore.queue;
  if (nextCard) {
    router.replace({
      query: {
        "card-id": String.fromCodePoint(nextCard.cardId),
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
        <template v-if="cardType?.endsWith('-read')"> Reading </template>
        <template v-else-if="cardType?.endsWith('-write')"> Writing </template>
        Review
      </strong>

      <ReviewRemainCount class="counts" />
    </header>

    <section v-if="loading" class="loading">
      <p>Loading next card…</p>
      <AppLoading class="loading-icon" />
    </section>

    <template v-else-if="currentCard">
      <ReviewCard
        :card="currentCard"
        :is-rating="isRating"
        @answer="$router.replace({ query: { ...$route.query, rating: '' } })"
        @rate="handleRate($event)"
      />
    </template>
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
