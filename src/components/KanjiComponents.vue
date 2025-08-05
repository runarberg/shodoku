<script setup lang="ts">
import { pipe } from "yta";
import { groupBy } from "yta/sync";

import { useKanjiVGComponents } from "../helpers/kanjivg.ts";
import { KanjiComponent } from "../types.ts";
import KanjiComponentItem from "./KanjiComponentItem.vue";

const components = useKanjiVGComponents();

function originals(
  parts: KanjiComponent[],
): Map<string | null, KanjiComponent[]> {
  return pipe(
    parts,
    groupBy((part) => part.original || null),
  );
}
</script>

<template>
  <section>
    <h2>
      Components
      <template v-if="components.size > 0"> ({{ components.size }}) </template>
    </h2>

    <ul class="component-list">
      <template v-for="[literal, partss] of components" :key="literal">
        <li v-for="[original, parts] of originals(partss)" :key="original ?? 0">
          <KanjiComponentItem
            :literal="literal"
            :parts="parts"
            :original="original"
          />
        </li>
      </template>
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

  @media screen and (max-width: 60ch) {
    display: flex;
    flex-direction: column;
  }
}
</style>
