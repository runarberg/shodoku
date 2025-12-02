<script setup lang="ts">
import { kanaRoute } from "../router.ts";
import { KanaInfo } from "../types.ts";
import KanaReading from "./KanaReading.vue";

defineProps<{
  kana: KanaInfo;
  hideReading?: boolean;
}>();
</script>

<template>
  <aside class="kana-related">
    <dl class="related-dl" :class="{ 'dd-hidden': hideReading }">
      <dt>Reading</dt>
      <dd>
        <strong class="reading base-reading">{{ kana.reading }}</strong>
      </dd>

      <template v-if="kana.base">
        <dt>Base</dt>
        <dd v-if="typeof kana.base === 'string'">
          <RouterLink :to="kanaRoute(kana.base)">
            {{ kana.base }}
            <KanaReading class="reading" :literal="kana.base" />
          </RouterLink>
        </dd>
        <div v-else class="dd-items">
          <dd v-for="base of kana.base" :key="base">
            <RouterLink :to="kanaRoute(base)">
              {{ base }}
              <KanaReading class="reading" :literal="base" />
            </RouterLink>
          </dd>
        </div>
      </template>

      <template v-if="kana.dakuten">
        <dt>Dakuten</dt>
        <dd>
          <RouterLink :to="kanaRoute(kana.dakuten)">
            {{ kana.dakuten }}
            <KanaReading class="reading" :literal="kana.dakuten" />
          </RouterLink>
        </dd>
      </template>

      <template v-if="kana.handakuten">
        <dt>Handakuten</dt>
        <dd>
          <RouterLink :to="kanaRoute(kana.handakuten)">
            {{ kana.handakuten }}
            <KanaReading class="reading" :literal="kana.handakuten" />
          </RouterLink>
        </dd>
      </template>

      <template v-if="kana.youon">
        <dt>Yōon</dt>
        <div class="dd-items">
          <dd v-for="youon of kana.youon" :key="youon">
            <RouterLink :to="kanaRoute(youon)">
              {{ youon }}
              <KanaReading class="reading" :literal="youon" />
            </RouterLink>
          </dd>
        </div>
      </template>

      <template v-if="kana.hiragana">
        <dt>Hiragana</dt>
        <dd>
          <RouterLink :to="kanaRoute(kana.hiragana)">
            {{ kana.hiragana }}
          </RouterLink>
        </dd>
      </template>

      <template v-else-if="kana.katakana">
        <dt>Katakana</dt>
        <dd>
          <RouterLink :to="kanaRoute(kana.katakana)">
            {{ kana.katakana }}
          </RouterLink>
        </dd>
      </template>
    </dl>
  </aside>
</template>

<style scoped>
.related-dl {
  align-items: center;
  gap: 1ex 1em;
  display: grid;
  grid-template-columns: max-content auto;
  justify-items: start;

  & dd,
  & dt {
    margin: 0;
    padding-block: 0.2ex;
  }

  & dt {
    font-weight: 600;
  }

  & dd {
    background: oklch(from var(--background-strong) l c h / 0.6);
    border-radius: 0.5ex;
    padding-inline: 0.5ex;

    & a {
      color: inherit;
      text-decoration: none;
    }
  }

  & > :is(dd, .dd-items) {
    gap: 0.5ex 1ex;
    display: flex;
    flex-wrap: wrap;
  }

  &.dd-hidden dd {
    visibility: hidden;
  }
}

.reading {
  color: var(--text-light);
  font-size: 0.85em;

  &.base-reading {
    font-size: 1em;
    font-weight: 600;
  }
}
</style>
