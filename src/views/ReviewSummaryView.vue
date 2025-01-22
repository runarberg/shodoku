<script setup lang="ts">
import ReviewSummary from "../components/ReviewSummary.vue";
</script>

<template>
  <article>
    <header class="article-header">
      <h2 class="title">Review Summary</h2>
    </header>

    <ReviewSummary />
  </article>
</template>

<style scoped>
.article-header {
  margin-block-end: 1.5em;

  & .title {
    margin-block: 0;
  }
}
</style>
