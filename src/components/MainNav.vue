<script setup lang="ts">
import { aboutRoute, homeRoute, decksRoute } from "../router";
</script>

<template>
  <nav class="main-nav">
    <ul class="nav-list">
      <li>
        <RouterLink :to="homeRoute" class="nav-item"> Home </RouterLink>
      </li>

      <li>
        <RouterLink :to="decksRoute" class="nav-item"> Decks </RouterLink>
      </li>

      <li>
        <RouterLink :to="aboutRoute" class="nav-item"> About </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.nav-list {
  display: flex;
  flex-direction: column;
  list-style: none;
  padding: 0;
  margin: 0;
  row-gap: 1ex;

  @media screen and (max-width: 75ch) {
    justify-content: space-evenly;
    column-gap: 1ex;
    flex-direction: row;
  }

  & > li {
    font-size: 1.2em;
    font-weight: 600;
  }

  & .nav-item {
    text-decoration: none;
    color: var(--accent-color);
  }
}
</style>
