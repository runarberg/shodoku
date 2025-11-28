<script setup lang="ts">
import { kanaRoute } from "../router";

defineProps<{
  headings?: string[];
  rows: Array<{ heading?: string; cells: string[] }>;
}>();
</script>

<template>
  <table class="kana-table">
    <thead v-if="headings">
      <tr>
        <th v-for="(heading, i) of headings" :key="i">
          <span v-if="heading" class="aiueo">{{ heading }}</span>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="({ heading, cells }, i) of rows" :key="i">
        <th v-if="heading">
          <span class="consonant">{{ heading }}</span>
        </th>

        <td v-for="(cell, j) of cells" :key="j">
          <RouterLink v-if="cell" class="kana-literal" :to="kanaRoute(cell)">
            {{ cell }}
          </RouterLink>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.kana-table th .aiueo {
  display: block;
  inline-size: 1.2em;
  text-align: center;
}

.kana-table th .consonant {
  display: block;
  padding-block-start: 0.5ex;
}

.kana-literal {
  color: inherit;
  font-size: 1.2em;
  text-decoration: none;
}
</style>
