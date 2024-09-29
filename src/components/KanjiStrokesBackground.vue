<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  viewBox: string;
}>();

const box = computed(() => {
  const [x, y, width, height] = props.viewBox.split(",");

  return {
    x: Number.parseInt(x),
    y: Number.parseInt(y),
    width: Number.parseInt(width),
    height: Number.parseInt(height),
  };
});

const midLineX = computed(() => {
  const { x, width } = box.value;

  return x + width / 2;
});

const midLineY = computed(() => {
  const { y, height } = box.value;

  return y + height / 2;
});
</script>

<template>
  <g class="kanji-strokes-background">
    <rect
      class="background"
      :x="box.x"
      :y="box.y"
      :width="box.width"
      :height="box.width"
      rx="5"
    />

    <line
      class="midline"
      :x1="box.x + 1"
      :y1="midLineY"
      :x2="box.x + box.width - 1"
      :y2="midLineY"
    />

    <line
      class="midline"
      :x1="midLineX"
      :y1="box.y + 1"
      :x2="midLineX"
      :y2="box.y + box.height - 1"
    />

    <line
      class="quartline"
      :x1="midLineX / 2"
      :y1="box.y + 1"
      :x2="midLineX / 2"
      :y2="box.y + box.height - 1"
    />

    <line
      class="quartline"
      :x1="(3 * midLineX) / 2"
      :y1="box.y + 1"
      :x2="(3 * midLineX) / 2"
      :y2="box.y + box.height - 1"
    />

    <line
      class="quartline"
      :x1="box.x + 1"
      :y1="midLineY / 2"
      :x2="box.x + box.width - 1"
      :y2="midLineY / 2"
    />

    <line
      class="quartline"
      :x1="box.x + 1"
      :y1="(3 * midLineY) / 2"
      :x2="box.x + box.width - 1"
      :y2="(3 * midLineY) / 2"
    />
  </g>
</template>

<style scoped>
.background {
  fill: var(--background-strong);
}

.midline,
.quartline {
  stroke: var(--light-gray);
}

.midline {
  stroke-width: 1px;
  stroke-dasharray: 4;
  stroke-dashoffset: 8;
}

.quartline {
  stroke-width: 0.5px;
  stroke-dasharray: 2;
  stroke-dashoffset: 0;
}
</style>
