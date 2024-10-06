<script setup lang="ts">
import { kanjiRoute } from "../router.ts";
import { db } from "../db";
import { useLiveQuery } from "../helpers/db";

const props = defineProps<{
  deck: string;
}>();

const { error, value: deck } = useLiveQuery(() =>
  db.cards.where("decks").equals(props.deck).sortBy("order")
);
</script>

<template>
  <p v-if="error">{{ error }}</p>
  <ol v-else-if="deck" class="kanji-list">
    <li v-for="kanji of deck" class="kanji">
      <RouterLink :to="kanjiRoute(kanji.value)">{{ kanji.value }}</RouterLink>
    </li>
  </ol>
</template>

<style scoped>
.kanji-list {
  display: flex;
  flex-wrap: wrap;
  column-gap: 1ex;
  list-style: none;
  margin: 0;
}

.kanji {
  font-size: 1.2em;

  & a {
    color: inherit;
    text-decoration: none;
  }
}
</style>
