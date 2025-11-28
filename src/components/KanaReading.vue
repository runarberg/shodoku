<script setup lang="ts">
import { useKanaInfo } from "../helpers/kana.ts";

const props = defineProps<{
  literal: string;
}>();

const kanaInfo = useKanaInfo(() => props.literal);
</script>

<template>
  <span v-if="kanaInfo?.reading" class="kana-reading">{{
    kanaInfo?.reading
  }}</span>
</template>
