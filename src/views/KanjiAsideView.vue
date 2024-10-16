<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

import KanjiAsideNav from "../components/KanjiAsideNav.vue";
import { db } from "../db/index.ts";
import { useLiveQuery } from "../helpers/db.ts";

const route = useRoute();
const kanjiId = computed(() => {
  if (typeof route.params.kanji !== "string") {
    return null;
  }

  return route.params.kanji.codePointAt(0) ?? null;
});

const { result: decks } = useLiveQuery(async () =>
  (await db)
    .transaction("decks")
    .store.index("cards")
    .getAll(IDBKeyRange.only(kanjiId.value))
);
</script>

<template>
  <aside v-if="kanjiId && decks && decks.length > 0">
    <KanjiAsideNav
      v-for="deck of decks"
      :key="deck.name"
      :deck="deck"
      :card-id="kanjiId"
      class="deck-nav"
    />
  </aside>
</template>

<style scoped>
.deck-nav:not(:first-child) {
  margin-block-start: 1ex;

  @media screen and (max-width: 75ch) {
    margin-block-start: 0;
  }
}
</style>
