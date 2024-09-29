<script setup lang="ts">
import { aboutRoute, homeRoute, kanjiListsRoute } from "../router";
</script>

<template>
  <nav class="main-nav">
    <ul class="nav-list">
      <li>
        <RouterLink :to="homeRoute" class="nav-item"> Home </RouterLink>
      </li>

      <li>
        <RouterLink :to="kanjiListsRoute" class="nav-item">
          Kanji Lists
        </RouterLink>
      </li>

      <li>
        <RouterLink :to="aboutRoute" class="nav-item"> About </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;

  & > li {
    font-size: 1.2em;
    font-weight: 600;

    &:not(:first-child) {
      margin-block-start: 1ex;
    }
  }

  & .nav-item {
    text-decoration: none;
    color: var(--accent-color);
  }
}
</style>
