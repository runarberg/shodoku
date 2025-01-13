<script setup lang="ts">
import { Furigana } from "../types.ts";

import MaybeHideKanji from "./MaybeHideKanji.vue";

const props = defineProps<{
  furigana: Furigana;
  kanji?: string | null;
  hideKanji?: boolean;
  hideReading?: boolean;
  linkKanji?: boolean;
}>();

function hideAnnotation(ruby: string, index: number) {
  if (!props.hideReading || !props.kanji) {
    return false;
  }

  if (ruby === "々" && props.furigana.at(index - 1)?.ruby === props.kanji) {
    return true;
  }

  return ruby.includes(props.kanji);
}
</script>

<template>
  <template v-for="({ ruby, rt }, i) of furigana">
    <template v-if="rt">
      <ruby
        ><MaybeHideKanji
          :hide="hideKanji"
          :kanji="kanji"
          :str="ruby"
          :link="linkKanji"
        /><rp>(</rp><rt v-if="hideAnnotation(ruby, i)">◌</rt
        ><rt v-else>{{ rt }}</rt
        ><rp>)</rp></ruby
      >
    </template>
    <MaybeHideKanji
      v-else
      :hide="hideKanji"
      :kanji="kanji"
      :str="ruby"
      :link="linkKanji"
    />
  </template>
</template>
