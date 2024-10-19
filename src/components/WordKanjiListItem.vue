<script setup lang="ts">
import { computed } from "vue";

import { useKanji } from "../helpers/kanji.ts";
import { kanjiRoute } from "../router.ts";

const props = defineProps<{
  kanji: string;
}>();

const kanjiInfo = useKanji(() => props.kanji.charCodeAt(0));

const reading = computed(() => {
  if (!kanjiInfo.value) {
    return null;
  }

  const { kunYomi, onYomi } = kanjiInfo.value;
  return (
    kunYomi.find((kun) => !/[.-]/.test(kun)) ?? kunYomi.at(0) ?? onYomi.at(0)
  );
});

const meaning = computed(() => kanjiInfo.value?.meanings.at(0));
</script>

<template>
  <div class="kanji-info">
    <RouterLink :to="kanjiRoute(kanji)" class="literal">{{ kanji }}</RouterLink>

    <p class="meaning">
      <strong v-if="meaning">{{ meaning }}</strong>
      <span v-if="reading" lang="ja"> ({{ reading }})</span>
    </p>
  </div>
</template>

<style scoped>
.kanji-info {
  align-items: center;
  column-gap: 1ex;
  display: flex;
}

.literal {
  align-items: center;
  aspect-ratio: 1;
  border: 1px solid var(--accent-color);
  border-radius: 0.2ex;
  background: var(--background-strong);
  color: var(--accent-color);
  display: flex;
  line-height: 1;
  flex-shrink: 0;
  font-size: 2em;
  font-weight: 600;
  justify-content: center;
  padding: 0.5ex;
  text-decoration: none;
}

.meaning {
  margin: 0;
  text-transform: capitalize;
}
</style>
