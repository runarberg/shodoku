<script setup lang="ts" ̣>
import { computed } from "vue";
import { useRoute } from "vue-router";

import KanjiComponentKanjiList from "../components/KanjiComponentKanjiList.vue";
import KanjiComponentVariationList from "../components/KanjiComponentVariationList.vue";
import { useKanjiComponent } from "../helpers/kanji-components.ts";

const route = useRoute();
const kanjiComponentLiteral = computed(() => {
  if (typeof route.params.kanjiComponent !== "string") {
    return null;
  }

  return route.params.kanjiComponent;
});

const componentInfo = useKanjiComponent(kanjiComponentLiteral);
const radical = computed(() => componentInfo.value?.radical);
const kanjiLiterals = computed(() =>
  Object.values(componentInfo.value?.kanji ?? {}).flat(),
);
</script>

<template>
  <article>
    <header class="header">
      <h1 class="title literal">
        <span lang="ja">{{ kanjiComponentLiteral }}</span>
      </h1>

      <p class="info">
        <span class="info-title">
          <template v-if="radical">Radical no. {{ radical.number }}</template>
          <template v-else>Kanji Component</template>
        </span>
        <strong class="meaning">{{
          radical?.en ?? componentInfo?.meaning
        }}</strong>
        <span v-if="componentInfo?.reading" class="reading" lang="ja">
          {{ radical?.jp ?? componentInfo.reading }}</span
        >
      </p>
    </header>

    <section v-if="componentInfo?.variationOf">
      <h2>
        Original
        <template v-if="componentInfo.variationOf.length > 1">
          &nbsp;({{ componentInfo.variationOf.length }})
        </template>
      </h2>

      <KanjiComponentVariationList :literals="componentInfo.variationOf" />
    </section>

    <section v-if="componentInfo?.variations">
      <h2>
        Variation
        <template v-if="componentInfo.variations.length > 1">
          &nbsp;({{ componentInfo.variations.length }})
        </template>
      </h2>

      <KanjiComponentVariationList :literals="componentInfo.variations" />
    </section>

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
