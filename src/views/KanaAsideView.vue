<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

import CardAsideNav from "../components/CardAsideNav.vue";
import { KANA_TABLE_ROW_DATA } from "../helpers/kana.ts";
import { kanaRoute } from "../router.ts";

const route = useRoute();

const literal = computed(() => {
  if (typeof route.params.kana !== "string") {
    return null;
  }

  return route.params.kana;
});

const deck = computed(() => {
  const kana = literal.value;
  if (!kana) {
    return null;
  }

  return KANA_TABLE_ROW_DATA.find(({ literals }) => literals.includes(kana));
});
</script>

<template>
  <aside v-if="literal && deck">
    <CardAsideNav
      :deck-cards="deck.literals"
      :card-id="literal"
      class="deck-nav"
    >
      <template #label>{{ deck.label }}</template>
      <template #card="{ cardId: other }">
        <RouterLink
          class="link"
          :class="{ 'link-active': other === literal }"
          :to="kanaRoute(other)"
          >{{ other }}</RouterLink
        >
      </template>
    </CardAsideNav>
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
