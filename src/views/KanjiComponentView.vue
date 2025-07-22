<script setup lang="ts" ̣>
import { computed } from "vue";
import { useRoute } from "vue-router";

import KanjiComponentKanjiList from "../components/KanjiComponentKanjiList.vue";
import { useKanjiComponent } from "../store/kanji-components.ts";
import { useRadical } from "../store/radicals.ts";

const route = useRoute();
const kanjiComponentLiteral = computed(() => {
  if (typeof route.params.kanjiComponent !== "string") {
    return null;
  }

  return route.params.kanjiComponent;
});

const kanjiLiterals = useKanjiComponent(kanjiComponentLiteral);
const componentInfo = useRadical(kanjiComponentLiteral);
</script>

<template>
  <article>
    <header class="header">
      <h1 class="title literal">
        <span lang="ja">{{kanjiComponentLiteral}}</span>
      </h1>

      <p class="info">
        <span class="info-title">Radical / Component</span>
        <strong class="meaning">{{ componentInfo?.meaning }}</strong>
        <span v-if="componentInfo?.reading" class="reading" lang="ja">
          {{ componentInfo.reading }}</span
        >
      </p>
    </header>

    <KanjiComponentKanjiList :kanji-literals="kanjiLiterals" />
  </article>
</template>

<style scoped>
.header {
  column-gap: 1em;
  display: flex;
}

.title {
  color: var(--bluegreen);
  font-size: 5em;
  font-weight: normal;
  grid-area: literal;
  line-height: 1em;
  margin: 0;
}

.info {
  align-items: start;
  display: flex;
  flex-flow: column;
  margin: 0;

  & .info-title {
    font-weight: 500;
    color: var(--bluegreen);
  }

  & .meaning {
    text-transform: capitalize;
    font-size: 1.5em;
  }

  & .reading {
    font-weight: 500;
    background: oklch(from var(--background-strong) l c h / 0.6);
    border-radius: 0.5ex;
    padding: 0.2ex 0.5ex;
  }
}
</style>
