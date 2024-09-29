<script setup lang="ts">
import MainNav from "./components/MainNav.vue";
import MainTitle from "./components/MainTitle.vue";
</script>

<template>
  <div class="app">
    <header class="header">
      <MainTitle class="main-title" />
      <MainNav class="main-nav" />
    </header>

    <main class="main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app {
  align-items: start;
  column-gap: 2em;
  display: flex;
  margin: 2em;
}

.header,
.main {
  background: oklch(100% none none / 0.4);
  border-radius: 1ex;
  padding: 1em;
}

.main-title {
  border-block-end: 2px solid var(--accent-color);
  margin-block-end: 1em;
  padding-block-end: 1em;
}

.main {
  flex-grow: 1;
  max-inline-size: 90ch;
}
</style>
