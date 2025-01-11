<script setup lang="ts">
import { homeRoute } from "../router";
</script>

<template>
  <RouterLink :to="homeRoute" class="main-title">
    <strong class="kanji" lang="ja">書読</strong>
    <h1 class="romaji">shodoku</h1>
  </RouterLink>
</template>

<style scoped>
.main-title {
  align-items: center;
  display: flex;
  flex-direction: column;
  text-decoration: none;
}

.kanji {
  color: var(--accent-color);
  font-size: 3em;
}

.romaji {
  color: var(--accent-color);
  font-size: 1.5em;
  margin: 0;
}
</style>
