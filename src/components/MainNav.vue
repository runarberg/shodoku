<script setup lang="ts">
import {
  decksRoute,
  dictionaryRoute,
  reviewRoute,
  settingsRoute,
} from "../router";
import AppButton from "./AppButton.vue";
</script>

<template>
  <nav class="main-nav">
    <ul class="nav-list">
      <li>
        <AppButton :to="reviewRoute" filled> Review </AppButton>
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
  row-gap: 1ex;

  @media screen and (max-width: 90ch) {
    align-items: center;
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
