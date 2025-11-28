<script setup lang="ts">
import { State } from "ts-fsrs";
import { computed, ref } from "vue";

import { useCardProgress } from "../helpers/fsrs.ts";
import { REVIEW_ROUTE_NAME } from "../router.ts";
import { useDecksContainingCard } from "../store/decks.ts";
import { KanjiInfo } from "../types.ts";
import AppMenu from "./AppMenu.vue";
import AppMenuItem from "./AppMenuItem.vue";
import KanjiManageDecksDialog from "./KanjiManageDecksDialog.vue";

const props = defineProps<{
  kanji: KanjiInfo;
}>();

const manageDecksDialog = ref<InstanceType<
  typeof KanjiManageDecksDialog
> | null>(null);

const decks = useDecksContainingCard(() => props.kanji.codepoint);
const progress = useCardProgress(
  () => props.kanji.codepoint,
  ["kanji-write", "kanji-read"],
);

const isNew = computed(() => {
  for (const { fsrs } of progress.value.values()) {
    if (fsrs.state !== State.New) {
      return false;
    }
  }

  return true;
});
</script>

<template>
  <AppMenu toggle-icon="ellipsis-vertical">
    <AppMenuItem @click="manageDecksDialog?.show()">
      <template v-if="decks.length === 0">Add to deck</template>
      <template v-else>Manage decks</template>
    </AppMenuItem>

    <AppMenuItem
      v-if="decks.length > 0 && isNew"
      :to="{
        name: REVIEW_ROUTE_NAME,
        query: {
          'card-id': kanji.codepoint,
          'card-type': 'kanji-write',
          singleton: '',
        },
      }"
      replace
    >
      Review now
    </AppMenuItem>

    <KanjiManageDecksDialog ref="manageDecksDialog" :kanji="kanji" />
  </AppMenu>
</template>
