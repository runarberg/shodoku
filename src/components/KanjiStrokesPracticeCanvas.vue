<script setup lang="ts">
import simplifySvgPath from "@luncheon/simplify-svg-path";
import { computed, ref, shallowReactive, watch } from "vue";

import { sleep } from "../helpers/time.ts";

const props = defineProps<{
  animatePause?: boolean;
}>();

const emit = defineEmits<{
  stroke: [];
}>();

type Point = { x: number; y: number };

const el = ref<SVGGElement | null>(null);
const svg = computed(() => el.value?.closest("svg"));
const viewBox = computed(() => svg.value?.viewBox.baseVal);
const strokes = shallowReactive<string[]>([]);
const points = shallowReactive<Point[]>([]);
const hinting = ref<string | null>(null);
const preAnimation = ref(false);

function toSVGCoords(event: PointerEvent): Point {
  if (!svg.value) {
    return { x: event.x, y: event.y };
  }

  const p = svg.value.createSVGPoint();
  p.x = event.x;
  p.y = event.y;

  const domPoint = p.matrixTransform(svg.value.getScreenCTM()?.inverse());

  return { x: domPoint.x, y: domPoint.y };
}

function handlePointerDown(event: PointerEvent) {
  if (!event.isPrimary) {
    return;
  }

  event.preventDefault();
  el.value?.setPointerCapture(event.pointerId);
  points.push(toSVGCoords(event));
}

function handlePointerMove(event: PointerEvent) {
  if (points.length === 0 || !event.isPrimary) {
    return;
  }

  points.push(toSVGCoords(event));
}

function handlePointerUp(event: PointerEvent) {
  if (!event.isPrimary) {
    return;
  }

  if (points.length > 1) {
    strokes.push(simplifySvgPath(points));
    emit("stroke");
  }

  el.value?.releasePointerCapture(event.pointerId);
  points.splice(0, points.length);

  svg.value?.parentElement?.click();
}

function strokeKeyframes(stroke: SVGPathElement): Keyframe[] {
  const l = stroke.getTotalLength();

  return [
    { strokeDasharray: l, strokeDashoffset: l },
    { strokeDasharray: l, strokeDashoffset: 0 },
  ];
}

const strokeAnimationOptions = {
  duration: 500,
  easing: "ease-in-out",
};

const animations: Animation[] = [];

async function startAnimation(): Promise<void> {
  if (!el.value) {
    return;
  }

  for (const stroke of el.value.querySelectorAll<SVGPathElement>(
    ".practice-strokes .stroke",
  )) {
    const animation = stroke.animate(
      strokeKeyframes(stroke),
      strokeAnimationOptions,
    );

    animation.pause();
    animations.push(animation);
  }

  preAnimation.value = false;
  await playAnimations();
}

async function playAnimations(): Promise<void> {
  let animation = animations.at(0);
  while (animation) {
    animation.play();
    await animation.finished;

    animations.shift();
    animation = animations.at(0);

    if (animation) {
      await sleep(100);
    }
  }
}

watch(
  () => props.animatePause,
  (shouldPause) => {
    if (shouldPause) {
      animations.at(0)?.pause();
    } else {
      animations.at(0)?.play();
    }
  },
);

const hintPath = ref<SVGPathElement | null>(null);
watch(hintPath, (stroke) => {
  if (stroke) {
    const animation = stroke.animate(
      strokeKeyframes(stroke),
      strokeAnimationOptions,
    );

    animation.finished.then(() => {
      hinting.value = null;
    });
  }
});

function clear() {
  strokes.splice(0, strokes.length);
}

function pop() {
  strokes.pop();
}

function push(d: string) {
  strokes.push(d);
}

function hint(d: string) {
  hinting.value = d;
}

defineExpose({
  clear,
  pop,
  push,
  hint,
  animate: startAnimation,
  prepareForAnimation() {
    preAnimation.value = true;
  },
});
</script>

<template>
  <g
    ref="el"
    class="kanji-strokes-practice-canvas canvas"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
  >
    <rect
      v-if="viewBox"
      class="background"
      :x="viewBox.x"
      :y="viewBox.y"
      :width="viewBox.width"
      :height="viewBox.height"
    />
    <g v-show="!preAnimation" class="practice-strokes">
      <path
        v-for="(stroke, i) of strokes"
        :key="i"
        class="stroke practice-stroke"
        :d="stroke"
      />
    </g>

    <path v-if="hinting" ref="hintPath" class="stroke hint" :d="hinting" />

    <polyline
      class="stroke current-stroke"
      :points="points.map(({ x, y }) => `${x},${y}`).join(' ')"
    />
  </g>
</template>

<style scoped>
.canvas {
  cursor: crosshair;
  touch-action: none;
}

.background {
  fill: transparent;
  stroke: none;
}

.stroke {
  fill: none;
  stroke: currentcolor;
  stroke-width: 3px;
  stroke-linecap: round;
  stroke-linejoin: round;

  &.hint {
    color: light-dark(var(--light-gray), var(--dark-gray));
  }
}
</style>
