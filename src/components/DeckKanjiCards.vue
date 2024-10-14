<script setup lang="ts">
import { kanjiRoute } from "../router.ts";

defineProps<{
  kanji: number[];
}>();
</script>

<template>
  <ol class="kanji-list">
    <li v-for="kanji of kanji" class="kanji">
      <RouterLink :to="kanjiRoute(String.fromCodePoint(kanji))" :key="kanji">{{
        String.fromCodePoint(kanji)
      }}</RouterLink>
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
