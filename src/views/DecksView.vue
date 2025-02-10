<script setup lang="ts">
import AppButton from "../components/AppButton.vue";
import DeckList from "../components/DeckList.vue";
import { deckBrowserRoute } from "../router";
</script>

<template>
  <article>
    <header class="article-header">
      <h2 class="title">Your Decks</h2>

      <div class="actions">
        <AppButton :to="deckBrowserRoute" prefix-icon="draw"
          >Manage Decks</AppButton
        >
      </div>
    </header>

    <DeckList />
  </article>
</template>

<style scoped>
.article-header {
  align-items: center;
  display: flex;
  margin-block-end: 1.5em;

  & .title {
    margin-block: 0;
  }

  & .actions {
    margin-inline-start: auto;
  }
}
</style>
