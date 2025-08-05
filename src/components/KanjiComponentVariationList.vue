<script setup lang="ts">
import { kanjiComponentRoute } from "../router.ts";

defineProps<{
  literals: string[];
}>();
</script>

<template>
  <ul class="component-list">
    <li v-for="literal of literals" :key="literal">
      <RouterLink :to="kanjiComponentRoute(literal)" class="literal">
        {{ literal }}
      </RouterLink>
    </li>
  </ul>
</template>

<style scoped>
.component-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1ex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.literal {
  align-items: center;
  aspect-ratio: 1;
  border: 1px solid var(--bluegreen);
  border-radius: 0.2ex;
  background: var(--background-strong);
  color: var(--bluegreen);
  display: flex;
  flex-shrink: 0;
  font-size: 1.2em;
  line-height: 1;
  justify-content: center;
  padding: 0.5ex;
  text-decoration: none;
}
</style>
