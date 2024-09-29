<script setup lang="ts">
import { onMounted, ref, watch } from "vue";

const props = defineProps<{
  strokes: SVGGElement;
}>();

const container = ref<SVGGElement | null>(null);

function render() {
  container.value?.replaceChildren(props.strokes ?? "");
}

watch(() => props.strokes, render);

onMounted(() => {
  render();
});
</script>

<template>
  <g ref="container" class="kanji-strokes" />
</template>

<style scoped>
.kanji-strokes {
  fill: none;
  stroke: currentcolor;
  stroke-width: 3px;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
