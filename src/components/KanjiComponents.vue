<script setup lang="ts">
import { useKanjiVGComponents } from "../helpers/kanjivg";

import KanjiComponentItem from "./KanjiComponentItem.vue";

const components = useKanjiVGComponents();
</script>

<template>
  <section>
    <h2>
      Components
      <template v-if="components.size > 0"> ({{ components.size }})</template>
    </h2>

    <ul class="component-list">
      <li v-for="[literal, parts] of components" :key="literal">
        <KanjiComponentItem :literal="literal" :parts="parts" />
      </li>
    </ul>
  </section>
</template>

<style scoped>
.component-list {
  display: grid;
  gap: 1ex;
  grid-template-columns: 1fr 1fr;
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
