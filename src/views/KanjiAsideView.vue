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

const { result: decks } = useLiveQuery(
  computed(() => {
    const id = kanjiId.value;

    return async () =>
      (await db)
        .transaction("decks")
        .store.index("cards")
        .getAll(IDBKeyRange.only(id));
  }),
);

const activeDecks = computed(() => decks.value?.filter(({ active }) => active));
</script>

<template>
  <aside v-if="kanjiId && activeDecks && activeDecks.length > 0">
    <KanjiAsideNav
      v-for="deck of activeDecks"
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
