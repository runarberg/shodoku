<script setup lang="ts">
withDefaults(
  defineProps<{
    str: string;
    kanji?: string | null;
    hide?: boolean;
  }>(),
  {
    kanji: null,
    hide: false,
  }
);
</script>

<template>
  <template v-if="!kanji || !hide">{{ str }}</template>
  <template v-else>
    <template v-for="char of str">
      <span v-if="char === kanji" class="placeholder">◌</span>
      <template v-else>{{ char }}</template>
    </template>
  </template>
</template>
