<script setup lang="ts">
import { vIntersectionObserver } from "@vueuse/components";

import MainFooter from "./components/MainFooter.vue";
import MainNav from "./components/MainNav.vue";
import MainTitle from "./components/MainTitle.vue";
import ReloadPrompt from "./components/ReloadPrompt.vue";
import { setupGlobalPreferences } from "./store/preferences.ts";

function onIntersectionObserver([entry]: IntersectionObserverEntry[]) {
  if (!CSS.supports("container-type", "scroll-state")) {
    entry.target.toggleAttribute("data-stuck", entry.intersectionRatio < 1);
  }
}

setupGlobalPreferences();
</script>

<template>
  <div class="app">
    <header class="header">
      <MainTitle class="main-title" />
      <MainNav
        v-intersection-observer="[onIntersectionObserver, { threshold: [1] }]"
        class="main-nav"
      />
    </header>

    <RouterView id="app:main" class="main" />
    <MainFooter class="footer" />

    <ReloadPrompt />
  </div>
</template>

<style scoped>
.app {
  --body-margin: 2em;

  align-items: start;
  display: grid;
  grid-template:
    "header . main  " 1fr
    "header . .     " var(--body-margin)
    "header . footer" auto
    / auto 1em 1fr;
  margin: var(--body-margin);
  justify-items: stretch;
  min-block-size: 100vh;

  @media screen and (max-width: 90ch) {
    --body-margin: 1em;

    align-items: stretch;
    display: flex;
    flex-direction: column;
    margin: var(--body-margin);
    row-gap: var(--body-margin);
  }

  @media screen and (max-width: 75ch) {
    --body-margin: 1ex;
  }
}

.header,
.footer {
  background: var(--background-content);
  border-radius: 1ex;
}

.footer {
  grid-area: footer;
  max-inline-size: 90ch;
  padding: 1em;
}

.header {
  container-type: scroll-state;
  grid-area: header;
  position: sticky;
  inset-block-start: 1em;

  @media screen and (max-width: 90ch) {
    inset-block-start: -8.333em;
    z-index: 1;
  }
}

.main-title,
.main-nav {
  padding: 1em;
}

.main-title {
  border-block-end: 2px solid var(--accent-color);
}

.main-nav {
  transition-duration: 300ms;
  transition-property: background, border-color, font-size, margin, padding;
  transition-timing-function: ease-out;

  @media screen and (max-width: 90ch) {
    @container scroll-state(stuck: top) {
      background: var(--background-light);
      border-block-end: 2px solid var(--accent-color);
      font-size: 0.85em;
      margin-inline: calc(-1 * var(--body-margin));
      padding-block: 0.5ex;
    }

    @supports not (container-type: scroll-state) {
      &[data-stuck] {
        background: var(--background-light);
        border-block-end: 2px solid var(--accent-color);
        font-size: 0.85em;
        margin-inline: calc(-1 * var(--body-margin));
        padding-block: 2px;
      }
    }
  }
}

.main {
  align-self: stretch;
  grid-area: main;

  @media screen and (max-width: 90ch) {
    min-block-size: calc(100vh - 5em);
  }
}

.footer {
  grid-area: footer;
}
</style>
