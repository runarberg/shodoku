<script setup lang="ts">
import { useSentence } from "../helpers/sentences";
import MaybeHideKanji from "./MaybeHideKanji.vue";

const props = defineProps<{
  sentenceId: number;
  hideKanji?: string | null;
  hideReading?: string | null;
  hideMeaning?: boolean;
}>();

const sentence = useSentence(() => props.sentenceId);

function hideAnnotation(ruby: string) {
  return props.hideReading && ruby.includes(props.hideReading);
}
</script>

<template>
  <div v-if="sentence">
    <p lang="ja" class="sentence">
      <template v-for="word of sentence.words">
        <template v-for="{ ruby, rt } of word.furigana">
          <template v-if="rt">
            <ruby
              ><MaybeHideKanji
                :hide="hideKanji != null"
                :kanji="hideKanji"
                :str="ruby"
              /><rp>(</rp><rt v-if="hideAnnotation(ruby)">◌</rt
              ><rt v-else>{{ rt }}</rt
              ><rp>)</rp></ruby
            >
          </template>
          <MaybeHideKanji
            v-else
            :hide="hideKanji != null"
            :kanji="hideKanji"
            :str="ruby"
          />
        </template>
      </template>
    </p>

    <p v-show="!hideMeaning" lang="en" class="translation">
      {{ sentence.meaning }}
    </p>
  </div>
</template>

<style scoped>
.sentence,
.translation {
  margin: 0;
}
</style>
