<script setup lang="ts">
import {
  decksRoute,
  dictionaryRoute,
  reviewRoute,
  settingsRoute,
} from "../router.ts";
</script>

<template>
  <nav class="main-nav">
    <ul class="nav-list">
      <li>
        <RouterLink :to="reviewRoute" class="nav-item"> Review </RouterLink>
      </li>

      <li>
        <RouterLink :to="decksRoute" class="nav-item"> Decks </RouterLink>
      </li>

      <li>
        <RouterLink :to="dictionaryRoute" class="nav-item">
          Dictionary
        </RouterLink>
      </li>

      <li>
        <RouterLink :to="settingsRoute" class="nav-item"> Settings </RouterLink>
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
  max-inline-size: 100%;
  overflow: auto;
  scrollbar-width: none;

  @media screen and (max-width: 90ch) {
    align-items: center;
    justify-content: space-evenly;
    flex-direction: row;
  }

  & > li {
    font-size: 1.2em;
    font-weight: 600;
  }

  & .nav-item {
    border-radius: 0.5ex;
    color: var(--accent-color);
    display: block;
    padding: 1ex;
    text-decoration: none;

    &.router-link-active {
      background: var(--accent-color);
      color: light-dark(var(--background-light), var(--background-strong));
    }
  }
}
</style>
