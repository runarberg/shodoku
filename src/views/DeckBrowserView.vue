<script setup lang="ts">
import AppButton from "../components/AppButton.vue";
import DeckBrowser from "../components/DeckBrowser.vue";
import PageMain from "../components/PageMain.vue";
import { decksRoute } from "../router.ts";
</script>

<template>
  <PageMain>
    <header class="article-header">
      <h2 class="title">Add Decks</h2>

      <div class="actions">
        <AppButton :to="decksRoute" prefix-icon="arrow-left">
          Back to your decks
        </AppButton>
      </div>
    </header>

    <DeckBrowser />
  </PageMain>
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
