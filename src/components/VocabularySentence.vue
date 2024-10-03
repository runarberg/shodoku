<script setup lang="ts">
import { Sentence } from "../types";

defineProps<{
  sentence: Sentence;
}>();
</script>

<template>
  <div>
    <p lang="ja" class="sentence">
      <template v-for="word of sentence.words">
        <template v-for="{ ruby, rt } of word.furigana">
          <template v-if="rt">
            <ruby
              >{{ ruby }}<rp>(</rp><rt>{{ rt }}</rt
              ><rp>)</rp></ruby
            >
          </template>
          <template v-else>{{ ruby }}</template>
        </template>
      </template>
    </p>

    <p lang="en" class="translation">{{ sentence.meaning }}</p>
  </div>
</template>

<style scoped>
.sentence,
.translation {
  margin: 0;
}
</style>
