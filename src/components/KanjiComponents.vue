<script setup lang="ts">
import { ref, watch } from "vue";
import { pipe } from "yta";
import { groupBy } from "yta/sync";

import { useKanjiVGComponents } from "../helpers/kanjivg.ts";
import { KanjiComponent } from "../types.ts";
import AppButton from "./AppButton.vue";
import KanjiComponentItem from "./KanjiComponentItem.vue";

const MAX_SHOWN = 4;

const components = useKanjiVGComponents();
const showAll = ref(false);

defineProps<{
  hide?: boolean;
}>();

function originals(
  parts: KanjiComponent[],
): Map<string | null, KanjiComponent[]> {
  return pipe(
    parts,
    groupBy((part) => part.original || null),
  );
}

watch(components, () => {
  showAll.value = false;
});
</script>

<template>
  <section>
    <h2>
      Components
      <template v-if="!hide && components.size > 0">
        ({{ components.size }})
      </template>
    </h2>

    <p v-if="hide" class="hidden-info">[hidden]</p>
    <ul v-else class="component-list">
      <template v-for="([literal, partss], i) of components" :key="literal">
        <template v-if="showAll || i < MAX_SHOWN">
          <li
            v-for="[original, parts] of originals(partss)"
            :key="original ?? 0"
          >
            <KanjiComponentItem
              :literal="literal"
              :parts="parts"
              :original="original"
            />
          </li>
        </template>
      </template>
    </ul>

    <AppButton
      v-if="!hide && !showAll && components.size > MAX_SHOWN"
      class="show-more-button"
      inline
      @click="showAll = true"
    >
      show {{ components.size - MAX_SHOWN }} more
    </AppButton>
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

hidden-info {
  color: var(--text-light);
  font-weight: 500;
}

.show-more-button {
  margin-block-start: 1em;
  font-weight: normal;
}
</style>
