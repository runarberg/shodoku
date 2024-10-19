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

    <RouterView class="aside" name="aside" />

    <main class="main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app {
  align-items: start;
  display: grid;
  grid-template:
    "header . main aside"
    / auto 1em minmax(min-content, 90ch) 1fr;
  margin: 2em;
  justify-items: stretch;
  min-block-size: calc(100vh - 4em);

  @media screen and (max-width: 90ch) {
    grid-template:
      "header header"
      ". ." 2em
      "main aside"
      / 1fr auto;
    justify-items: stretch;
  }

  @media screen and (max-width: 75ch) {
    align-items: stretch;
    display: flex;
    flex-direction: column;
    margin-block: 1ex;
    margin-inline: 1ex;
    row-gap: 1ex;
  }
}

.header,
.aside,
.main {
  background: oklch(100% none none / 0.4);
  border-radius: 1ex;
  padding: 1em;
}

.header,
.aside {
  position: sticky;
  inset-block-start: 1em;

  @media screen and (max-width: 75ch) {
    position: static;
  }
}

.header {
  grid-area: header;

  @media screen and (max-width: 90ch) {
    position: static;
  }
}

.main-title {
  border-block-end: 2px solid var(--accent-color);
  margin-block-end: 1em;
  padding-block-end: 1em;
}

.main {
  align-self: stretch;
  grid-area: main;

  @media screen and (max-width: 75ch) {
    min-block-size: calc(100vh - 4ex);
  }
}

.aside {
  grid-area: aside;
  margin-inline-start: 1em;
  justify-self: start;

  @media screen and (max-width: 75ch) {
    margin-inline-start: 0;
  }
}
</style>
