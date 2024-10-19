<script setup lang="ts">
import { isKanji } from "../helpers/text.ts";
import { kanjiRoute } from "../router.ts";

withDefaults(
  defineProps<{
    str: string;
    kanji?: string | null;
    hide?: boolean;
    link?: boolean;
  }>(),
  {
    kanji: null,
    hide: false,
    link: false,
  }
);
</script>

<template>
  <template v-if="link">
    <template v-for="char of str">
      <RouterLink v-if="isKanji(char)" :to="kanjiRoute(char)" class="link">{{
        char
      }}</RouterLink>
      <template v-else>{{ char }}</template>
    </template>
  </template>

  <template v-else-if="!kanji || !hide">{{ str }}</template>

  <template v-else>
    <template v-for="char of str">
      <span v-if="char === kanji" class="placeholder">◌</span>
      <template v-else>{{ char }}</template>
    </template>
  </template>
</template>

<style scoped>
.link {
  color: inherit;
  text-decoration: none;
}
</style>
