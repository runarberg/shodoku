<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { RecordLogItem } from "ts-fsrs";

import KanjiReview from "../components/KanjiReview.vue";
import { CardProgress, CardType } from "../types";
import { useCardProgress } from "../store/cards";
import { rateCard } from "../db/cards";
import { liveQueryBroadcaster } from "../helpers/channels";
import ReviewRemainCount from "../components/ReviewRemainCount.vue";

const route = useRoute();
const router = useRouter();

function isCardType(thing: string): thing is CardType {
  return thing === "kanji-read" || thing === "kanji-write";
}

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

const currentCard = useCardProgress(answered);

async function handleRate(progress: CardProgress, next: RecordLogItem) {
  try {
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
        <template v-else>Finished Review</template>
      </strong>

      <ReviewRemainCount class="counts" />
    </header>

    <KanjiReview
      v-if="currentCard"
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
