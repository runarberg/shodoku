<script setup lang="ts">
import MainFooter from "./components/MainFooter.vue";
import MainNav from "./components/MainNav.vue";
import MainTitle from "./components/MainTitle.vue";
import { setupGlobalPreferences } from "./store/preferences.ts";

setupGlobalPreferences();
</script>

<template>
  <div class="app">
    <header class="header">
      <MainTitle class="main-title" />
      <MainNav class="main-nav" />
    </header>

    <RouterView class="aside" name="aside" />

    <main id="app:main" class="main">
      <RouterView />
    </main>

    <MainFooter class="footer" />
  </div>
</template>

<style scoped>
.app {
  align-items: start;
  display: grid;
  grid-template:
    "header . main aside" 1fr
    "header . . aside" 1em
    "header . footer aside"
    / auto 1em minmax(min-content, 90ch) 1fr;
  margin: 2em;
  justify-items: stretch;
  min-block-size: calc(100vh - 4em);

  @media screen and (max-width: 90ch) {
    grid-template:
      "header header"
      ". ." 2em
      "main aside" 1fr
      ". ." 2em
      "footer footer"
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
.main,
.footer {
  background: light-dark(
    oklch(100% none none / 0.4),
    oklch(0% none none / 0.7)
  );
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

.footer {
  grid-area: footer;
}
</style>
