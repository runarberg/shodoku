<script setup lang="ts">
import { ref, watch } from "vue";

import { kanjiRoute } from "../router.ts";

const props = defineProps<{
  listLabel: string;
  listPath: string;
}>();

const kanjiList = ref<string[] | null>(null);

watch(
  () => props.listPath,
  async (listPath) => {
    const response = await fetch(listPath);
    const text = await response.text();

    kanjiList.value = text.split("\n").filter((char) => char);
  },
  { immediate: true }
);
</script>

<template>
  <details class="kanji-list">
    <summary>{{ listLabel }}</summary>

    <ol v-if="kanjiList">
      <li v-for="kanji of kanjiList">
        <RouterLink :to="kanjiRoute(kanji)">{{ kanji }}</RouterLink>
      </li>
    </ol>
  </details>
</template>
