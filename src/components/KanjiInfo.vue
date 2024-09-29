<script setup lang="ts">
import { computed } from "vue";

type KanjiInfo = {
  codepoint: number;
  literal: string;
  meanings: string[];
  onYomi: string[];
  strokeCount: number;
  radical: number;
  grade?: string;
};

const props = defineProps<{
  kanji: KanjiInfo;
}>();

const hex = computed(() => props.kanji.codepoint.toString(16).padStart(5, "0"));
</script>

<template>
  <div class="kanji-info">
    <div v-if="kanji.meanings.length > 0" class="meanings">
      <p class="main-meaning meaning">
        <strong>{{ kanji.meanings.at(0) }}</strong>
      </p>

      <ul v-if="kanji.meanings.length > 1" class="additional-meanings">
        <li v-for="meaning of kanji.meanings.slice(1)" class="meaning">
          {{ meaning }}
        </li>
      </ul>
    </div>

    <p>
      <strong class="literal">{{ kanji.literal }}</strong>
      <code class="codepoint">U+{{ hex }}</code>
    </p>
  </div>
</template>

<style scoped>
.kanji-info {
  display: flex;
  flex-direction: column;
}

.main-meaning {
  font-size: 2em;
  margin: 0;
}

.additional-meanings {
  column-gap: 1ex;
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.meaning {
  text-transform: capitalize;
}

.literal {
  font-size: 2em;
  font-weight: normal;
  margin-block-end: 0.5em;
}

.codepoint {
  background: lightgray;
  padding-block: 0.2ex;
  padding-inline: 0.5ex;
}
</style>
