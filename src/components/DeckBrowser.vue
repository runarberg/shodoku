<script setup lang="ts">
import {
  basicKanjiDecks,
  genkiDecks,
  jlptDecks,
  newsFrequencyDecks,
} from "../helpers/decks";
import DeckBrowserCategory from "./DeckBrowserCategory.vue";
import DeckBrowserCustom from "./DeckBrowserCustom.vue";
</script>

<template>
  <ul class="categories">
    <li>
      <DeckBrowserCategory
        title="JLPT"
        category="jlpt"
        :deck-templates="jlptDecks"
      />
    </li>

    <li>
      <DeckBrowserCategory
        title="News Frequency"
        category="news"
        :deck-templates="newsFrequencyDecks"
      />
    </li>

    <li>
      <DeckBrowserCategory
        title="Genki"
        category="genki"
        :deck-templates="genkiDecks"
      />
    </li>

    <li>
      <DeckBrowserCategory
        title="Basic Kanji Book"
        category="basic-kanji"
        :deck-templates="basicKanjiDecks"
      />
    </li>

    <li>
      <DeckBrowserCustom />
    </li>
  </ul>
</template>

<style scoped>
.categories {
  list-style: none;
  margin: 0;
  padding: 0;

  & > li:not(:first-child) {
    margin-block-start: 1em;
  }
}
</style>
