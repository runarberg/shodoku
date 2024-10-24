<script setup lang="ts">
import { useWordSetenceIds } from "../helpers/words";
import WordListItem from "./WordListItem.vue";

const props = defineProps<{
  wordId: number;
}>();

const sentenceIds = useWordSetenceIds(() => props.wordId);
</script>

<template>
  <WordListItem :word="{ word: wordId, sentences: sentenceIds }" />
</template>
