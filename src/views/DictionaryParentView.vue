<script lang="ts" setup>
import { reactive } from "vue";
import {
  onBeforeRouteUpdate,
  RouteLocationNormalizedLoadedGeneric,
} from "vue-router";

import PageMain from "../components/PageMain.vue";
import AppButton from "../components/AppButton.vue";

const routeHistory = reactive<RouteLocationNormalizedLoadedGeneric[]>([]);

onBeforeRouteUpdate((_to, from) => {
  routeHistory.push(from);
});
</script>

<template>
  <div class="dictionary-parent-view">
    <nav class="breadcrumbs">
      <AppButton slim @click="$router.back()">Back</AppButton>

      <ol>
        <li v-for="route of routeHistory">
          <RouterLink :to="route">
            {{ route.name }}
          </RouterLink>
        </li>
        <li>
          <RouterLink :to="$route">
            {{ $route.name }}
          </RouterLink>
        </li>
      </ol>
    </nav>

    <RouterView class="aside" name="aside" />

    <PageMain class="main">
      <RouterView />
    </PageMain>
  </div>
</template>

<style scoped>
.dictionary-parent-view {
  display: flex;
  gap: 1em;
  flex-direction: row-reverse;
  justify-content: start;

  @media screen and (max-width: 75ch) {
    flex-direction: column;
    gap: var(--body-margin);
  }
}

.aside {
  align-self: start;
  background: var(--background-content);
  border-radius: 1ex;
  grid-area: aside;
  inset-block-start: 1em;
  justify-self: start;
  padding: 1em;
  position: sticky;

  @media screen and (max-width: 90ch) {
    inset-block-start: 3em;
  }

  @media screen and (max-width: 75ch) {
    align-self: stretch;
    position: static;
  }
}

.main {
  flex-grow: 1;
}
</style>
