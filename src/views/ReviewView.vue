<script setup lang="ts">
import { computed, toRaw } from "vue";
import { useRoute, useRouter } from "vue-router";
import { RecordLogItem, State } from "ts-fsrs";

import KanjiReview from "../components/KanjiReview.vue";
import { db } from "../db/index.ts";
import { Card } from "../types";
import { useRemainingCount, useReviewCard } from "../store/cards";

function currentReviewType({ fsrs }: Card): "read" | "write" {
  if (
    fsrs.write.state === State.New ||
    fsrs.write.state === State.Learning ||
    fsrs.write.state === State.Relearning
  ) {
    // Learn write first
    return "write";
  }

  // review whichever is more overdue.
  if (fsrs.write.due < fsrs.read.due) {
    return "write";
  }

  return "read";
}

const route = useRoute();
const router = useRouter();

const answeredKanji = computed(() => {
  if (typeof route.query.kanji !== "string") {
    return null;
  }

  return route.query.kanji;
});

const currentCard = useReviewCard(() => answeredKanji.value?.charCodeAt(0));
const remainingCount = useRemainingCount();

async function handleRate(card: Card, next: RecordLogItem) {
  const type = currentReviewType(card);

  try {
    await db.transaction("rw", [db.cards, db.reviews], async () => {
      await db.reviews.add({ cardId: card.id, type, log: next.log });
      await db.cards.put({
        ...toRaw(card),
        fsrs: {
          ...toRaw(card.fsrs),
          [type]: next.card,
        },
      });
    });

    router.replace({ query: { kanji: undefined } });
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
          <template v-if="currentReviewType(currentCard) === 'read'">
            Reading
          </template>
          <template v-else>Writing</template>
          Review
        </template>
        <template v-else>Finished Review</template>
      </strong>

      <div v-if="remainingCount" class="counts">
        <span class="review-count">
          {{ remainingCount.due }}
        </span>
        <span class="new-count">(+ {{ remainingCount.new }})</span>
        <span class="learning-count"> {{ remainingCount.learning }}</span>
      </div>
    </header>

    <KanjiReview
      v-if="currentCard"
      :card="currentCard"
      :type="currentReviewType(currentCard)"
      :answered="answeredKanji != null"
      @answer="$router.replace({ query: { kanji: currentCard.value } })"
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
  column-gap: 1ex;
  display: flex;
  font-size: 0.8em;
  font-weight: 600;
  margin-inline-start: auto;
}

.review-count {
  color: var(--blue);
}

.new-count {
  color: var(--green);
}

.learning-count {
  color: var(--orange);
}
</style>
