<script setup lang="ts">
import DeckBrowserCategory from "./DeckBrowserCategory.vue";

const jlptDecks = [
  {
    name: "jlpt-n5",
    label: "JLPT N5",
    priority: 5,
    content: "/data/kanji-lists/jlpt-n5.csv",
  },
  {
    name: "jlpt-n4",
    label: "JLPT N4",
    priority: 15,
    content: "/data/kanji-lists/jlpt-n4.csv",
  },
  {
    name: "jlpt-n3",
    label: "JLPT N3",
    priority: 30,
    content: "/data/kanji-lists/jlpt-n3.csv",
  },
  {
    name: "jlpt-n2",
    label: "JLPT N2",
    priority: 50,
    content: "/data/kanji-lists/jlpt-n2.csv",
  },
  {
    name: "jlpt-n1",
    label: "JLPT N1",
    priority: 100,
    content: "/data/kanji-lists/jlpt-n1.csv",
  },
];

const genkiDecks = [
  {
    name: "genki-03",
    label: "Leasson 3",
    priority: 1,
    content: "/data/kanji-lists/genki-03.csv",
  },
  {
    name: "genki-04",
    label: "Leasson 4",
    priority: 2,
    content: "/data/kanji-lists/genki-04.csv",
  },
  {
    name: "genki-05",
    label: "Leasson 5",
    priority: 3,
    content: "/data/kanji-lists/genki-05.csv",
  },
  {
    name: "genki-06",
    label: "Leasson 6",
    priority: 4,
    content: "/data/kanji-lists/genki-06.csv",
  },
  {
    name: "genki-07",
    label: "Leasson 7",
    priority: 5,
    content: "/data/kanji-lists/genki-07.csv",
  },
  {
    name: "genki-08",
    label: "Leasson 8",
    priority: 6,
    content: "/data/kanji-lists/genki-08.csv",
  },
  {
    name: "genki-09",
    label: "Leasson 9",
    priority: 7,
    content: "/data/kanji-lists/genki-09.csv",
  },
  {
    name: "genki-10",
    label: "Leasson 10",
    priority: 8,
    content: "/data/kanji-lists/genki-10.csv",
  },
  {
    name: "genki-11",
    label: "Leasson 11",
    priority: 9,
    content: "/data/kanji-lists/genki-11.csv",
  },
  {
    name: "genki-12",
    label: "Leasson 12",
    priority: 10,
    content: "/data/kanji-lists/genki-12.csv",
  },
  {
    name: "genki-13",
    label: "Leasson 13",
    priority: 11,
    content: "/data/kanji-lists/genki-13.csv",
  },
  {
    name: "genki-14",
    label: "Leasson 14",
    priority: 12,
    content: "/data/kanji-lists/genki-14.csv",
  },
  {
    name: "genki-15",
    label: "Leasson 15",
    priority: 13,
    content: "/data/kanji-lists/genki-15.csv",
  },
  {
    name: "genki-16",
    label: "Leasson 16",
    priority: 14,
    content: "/data/kanji-lists/genki-16.csv",
  },
  {
    name: "genki-17",
    label: "Leasson 17",
    priority: 15,
    content: "/data/kanji-lists/genki-17.csv",
  },
  {
    name: "genki-18",
    label: "Leasson 18",
    priority: 16,
    content: "/data/kanji-lists/genki-18.csv",
  },
  {
    name: "genki-19",
    label: "Leasson 19",
    priority: 17,
    content: "/data/kanji-lists/genki-19.csv",
  },
  {
    name: "genki-20",
    label: "Leasson 20",
    priority: 18,
    content: "/data/kanji-lists/genki-20.csv",
  },
  {
    name: "genki-21",
    label: "Leasson 21",
    priority: 19,
    content: "/data/kanji-lists/genki-21.csv",
  },
  {
    name: "genki-22",
    label: "Leasson 22",
    priority: 20,
    content: "/data/kanji-lists/genki-22.csv",
  },
  {
    name: "genki-23",
    label: "Leasson 23",
    priority: 21,
    content: "/data/kanji-lists/genki-23.csv",
  },
];
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
        title="Genki"
        category="genki"
        :deck-templates="genkiDecks"
      />
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
