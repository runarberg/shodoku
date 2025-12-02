<script setup lang="ts">
import { KanjiInfo } from "../types.ts";

defineProps<{
  kanji: KanjiInfo;
  hideReadings?: boolean;
}>();
</script>

<template>
  <section>
    <h2>Readings</h2>

    <dl class="kanji-readings">
      <dt>Kun</dt>
      <div class="dd-items" :data-blur="hideReadings ? true : null">
        <dd v-for="reading of kanji.kunYomi" :key="reading">
          {{ reading }}
        </dd>
      </div>

      <dt>On</dt>
      <div class="dd-items" :data-blur="hideReadings ? true : null">
        <dd v-for="reading of kanji.onYomi" :key="reading">
          {{ reading }}
        </dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.kanji-readings {
  gap: 1em;
  display: grid;
  grid-template-columns: max-content auto;

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
  }
}

.dd-items {
  gap: 0.5ex 1ex;
  display: flex;
  flex-wrap: wrap;

  &[data-blur] {
    visibility: hidden;
  }
}
</style>
