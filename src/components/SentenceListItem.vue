<script setup lang="ts">
import { ref, watch } from "vue";

import VocabularySentence from "./VocabularySentence.vue";

const props = defineProps<{
  sentenceId: number;
}>();

const sentenceInfo = ref(null);

watch(
  () => props.sentenceId,
  async (id) => {
    const response = await fetch(`/data/sentences-v1/${id}.json`);
    const data = await response.json();

    sentenceInfo.value = data;
  },
  { immediate: true }
);
</script>

<template>
  <VocabularySentence v-if="sentenceInfo" :sentence="sentenceInfo" />
</template>
