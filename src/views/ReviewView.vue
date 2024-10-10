<script setup lang="ts">
import { computed, toRaw } from "vue";
import { useRoute, useRouter } from "vue-router";
import { RecordLogItem, State } from "ts-fsrs";

import KanjiReview from "../components/KanjiReview.vue";
import { db } from "../db/index.ts";
import { scheduledCardIds } from "../db/cards.ts";
import { useLiveQuery } from "../helpers/db.ts";
import { Card } from "../types";

const HOUR = 1000 * 60 * 60;

// Keep a static copy of all the card ids we’ve scheduled.
const cardIds = scheduledCardIds();
const { value: cards, error } = useLiveQuery(async () =>
  db.cards.bulkGet(await cardIds)
);

const { value: reviewed, error: reviewedQueryError } = useLiveQuery(() => {
  const reviewStart = new Date(Date.now() - 8 * HOUR);
  return db.transaction("r", [db.reviews, db.cards], async () => {
    const ids = new Map<number, "read" | "write">();
    await db.reviews
      .where("log.review")
      .above(reviewStart)
      .each(({ cardId, type }) => ids.set(cardId, type));

    const done = await db.cards
      .where("id")
      .anyOf(...ids.keys())
      .filter((card) => {
        const type = ids.get(card.id);

        if (!type) {
          return false;
        }

        const fsrs = card.fsrs[type];
        return fsrs.state === State.Review;
      })
      .toArray();

    return done.map(({ id }) => id);
  });
});

const { value: learning, error: learningQueryError } = useLiveQuery(
  async () => {
    const unsorted = await db.cards
      .where("fsrs.read.state")
      .anyOf([State.Learning, State.Relearning])
      .or("fsrs.write.state")
      .anyOf([State.Learning, State.Relearning])
      .toArray();

    return unsorted.sort((a, b) => {
      const aDue = a.fsrs[currentReviewType(a)].due.getTime();
      const bDue = b.fsrs[currentReviewType(b)].due.getTime();

      return aDue - bDue;
    });
  }
);

const remainingCards = computed(() => {
  if (!cards.value) {
    return [];
  }

  return cards.value.filter((card): card is Card => {
    if (!card) {
      return false;
    }

    if (reviewed.value?.includes(card.id)) {
      return false;
    }

    if (!learning.value) {
      return false;
    }

    return learning.value.every((other) => other.id !== card.id);
  });
});

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

const currentLearning = computed(() => {
  const now = Date.now();

  return learning.value?.find((card) => {
    const type = currentReviewType(card);

    return card.fsrs[type].due.getTime() < now;
  });
});

const newCount = computed(() =>
  remainingCards.value.reduce((sum, card) => {
    const type = currentReviewType(card);
    if (card.fsrs[type].state === State.New) {
      return sum + 1;
    }
    return sum;
  }, 0)
);

const route = useRoute();
const router = useRouter();

const answeredCard = computed(() => {
  if (typeof route.query.kanji !== "string") {
    return null;
  }

  return cards.value?.find((card) => card?.value === route.query.kanji);
});

const currentCard = computed(() => {
  if (answeredCard.value) {
    return answeredCard.value;
  }

  if (currentLearning.value) {
    return currentLearning.value;
  }

  return remainingCards.value.at(0) ?? learning.value?.at(0) ?? null;
});

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
      <div class="counts">
        <span class="review-count">
          {{ remainingCards.length - newCount }}
        </span>
        <span class="new-count">(+ {{ newCount }})</span>
        <span class="learning-count"> {{ learning?.length ?? 0 }}</span>
      </div>
    </header>

    <KanjiReview
      v-if="currentCard"
      :card="currentCard"
      :type="currentReviewType(currentCard)"
      :answered="answeredCard != null"
      @answer="$router.replace({ query: { kanji: currentCard.value } })"
      @rate="handleRate(currentCard, $event)"
    />

    <p v-if="error">{{ error }}</p>
    <p v-if="reviewedQueryError">{{ reviewedQueryError }}</p>
    <p v-if="learningQueryError">{{ learningQueryError }}</p>
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
