<script setup lang="ts">
import KanjiList from "../components/KanjiList.vue";
</script>

<template>
  <article>
    <h2>Kanji Lists</h2>

    <ul>
      <li>
        <strong>JLPT</strong>

        <ul>
          <li>
            <KanjiList
              list-label="JLPT N5"
              list-path="/data/kanji-lists/jlpt-n5.csv"
            />
          </li>
          <li>
            <KanjiList
              list-label="JLPT N4"
              list-path="/data/kanji-lists/jlpt-n4.csv"
            />
          </li>
          <li>
            <KanjiList
              list-label="JLPT N3"
              list-path="/data/kanji-lists/jlpt-n3.csv"
            />
          </li>
          <li>
            <KanjiList
              list-label="JLPT N2"
              list-path="/data/kanji-lists/jlpt-n2.csv"
            />
          </li>
          <li>
            <KanjiList
              list-label="JLPT N1"
              list-path="/data/kanji-lists/jlpt-n1.csv"
            />
          </li>
        </ul>
      </li>
    </ul>
  </article>
</template>
