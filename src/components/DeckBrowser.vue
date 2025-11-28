<script setup lang="ts">
import {
  basicKanjiDecks,
  genkiDecks,
  jlptDecks,
  jouyouDecks,
  newsFrequencyDecks,
} from "../helpers/decks.ts";
import DeckBrowserCategory from "./DeckBrowserCategory.vue";
import DeckBrowserCustom from "./DeckBrowserCustom.vue";
import DeckBrowserKana from "./DeckBrowserKana.vue";
</script>

<template>
  <ul class="categories">
    <li>
      <DeckBrowserKana />
    </li>

    <li>
      <DeckBrowserCategory
        title="JLPT"
        category="jlpt"
        :deck-templates="jlptDecks"
      />
    </li>

    <li>
      <DeckBrowserCategory
        title="Jōyō Kanji"
        category="jouyou"
        :deck-templates="jouyouDecks"
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
