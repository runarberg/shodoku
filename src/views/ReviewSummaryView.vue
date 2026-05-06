<script setup lang="ts">
import PageMain from "../components/PageMain.vue";
import ReviewSummary from "../components/ReviewSummary.vue";
</script>

<template>
  <PageMain>
    <header class="article-header">
      <h2 class="title">Review Summary</h2>
    </header>

    <ReviewSummary />
  </PageMain>
</template>

<style scoped>
.article-header {
  margin-block-end: 1.5em;

  & .title {
    margin-block: 0;
  }
}
</style>
