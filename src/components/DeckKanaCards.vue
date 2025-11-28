<script setup lang="ts">
import DeckKanjiCardItem from "./DeckKanjiCardItem.vue";

defineProps<{
  name: string;
  kana: number[];
}>();
</script>

<template>
  <ol class="kana-list" :data-deck-name="name">
    <li
      v-for="codepoint of kana"
      :key="codepoint"
      :data-literal="String.fromCodePoint(codepoint)"
      class="kana"
    >
      <DeckKanjiCardItem type="kana" :codepoint="codepoint" />
    </li>
  </ol>
</template>

<style scoped>
.kana-list {
  column-gap: 1ex;
  display: grid;
  grid-template-columns: repeat(5, auto);
  justify-content: start;
  list-style: none;
  margin: 0;
  padding-inline-start: 1em;
  row-gap: 1em;

  &:is([data-deck-name="hiragana"], [data-deck-name="katakana"]) {
    align-content: end;
    writing-mode: vertical-rl;

    @media screen and (max-width: 60ch) {
      align-content: start;
      writing-mode: horizontal-tb;
    }
  }

  & .kana[data-literal="ゆ"],
  & .kana[data-literal="ユ"],
  & .kana[data-literal="ヴ"] {
    grid-column: 3;
  }

  & .kana[data-literal="デ"] {
    grid-column: 4;
  }

  & .kana[data-literal="よ"],
  & .kana[data-literal="を"],
  & .kana[data-literal="ヨ"],
  & .kana[data-literal="ヲ"] {
    grid-column: 5;
  }

  &[data-deck-name$="-dakuten"] {
    grid-template-rows: repeat(5, auto);

    & .kana[data-literal="ぱ"],
    & .kana[data-literal="ぴ"],
    & .kana[data-literal="ぷ"],
    & .kana[data-literal="ぺ"],
    & .kana[data-literal="ぽ"],
    & .kana[data-literal="パ"],
    & .kana[data-literal="ピ"],
    & .kana[data-literal="プ"],
    & .kana[data-literal="ペ"],
    & .kana[data-literal="ポ"] {
      grid-row: 5;
    }
  }

  &[data-deck-name$="-yoon"] {
    display: flex;
    flex-wrap: wrap;
  }
}
</style>
