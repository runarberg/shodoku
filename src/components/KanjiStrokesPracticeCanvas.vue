<script setup lang="ts">
import { computed, ref, shallowReactive, watch } from "vue";
import simplifySvgPath from "@luncheon/simplify-svg-path";
import simplify from "simplify-js";

const props = defineProps<{
  practiceStrokes: string[];
  animate?: boolean;
  animatePause?: boolean;
}>();

const emit = defineEmits<{
  stroke: [value: string];
}>();

type Point = { x: number; y: number };

const el = ref<SVGGElement | null>(null);
const svg = computed(() => el.value?.closest("svg"));
const viewBox = computed(() => svg.value?.viewBox.baseVal);
const points = shallowReactive<Point[]>([]);

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
  points.push(toSVGCoords(event));
}

function handlePointerMove(event: PointerEvent) {
  if (points.length === 0) {
    return;
  }

  el.value?.setPointerCapture(event.pointerId);
  points.push(toSVGCoords(event));
}

function handlePointerUp(event: PointerEvent) {
  emit("stroke", simplifySvgPath(points));

  el.value?.releasePointerCapture(event.pointerId);
  points.splice(0, points.length);
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
  endDelay: 100,
  easing: "ease-in-out",
};

const animations: Animation[] = [];

function animate() {
  if (!el.value) {
    return;
  }

  for (const stroke of el.value?.querySelectorAll<SVGPathElement>(
    "path.stroke"
  )) {
    const animation = stroke.animate(
      strokeKeyframes(stroke),
      strokeAnimationOptions
    );

    animation.pause();
    animations.push(animation);
  }

  playAnimations();
}

async function playAnimations() {
  let animation = animations.at(0);
  while (animation) {
    animation.play();
    await animation.finished;

    animations.shift();
    animation = animations.at(0);
  }
}

watch(
  () => props.animate,
  (shouldAnimate) => {
    if (shouldAnimate) {
      animate();
    }
  }
);

watch(
  () => props.animatePause,
  (shouldPause) => {
    if (shouldPause) {
      animations.at(0)?.pause();
    } else {
      animations.at(0)?.play();
    }
  }
);
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
    <path v-for="stroke of practiceStrokes" class="stroke" :d="stroke" />
    <polyline
      class="stroke current-stroke"
      :points="
        simplify(points)
          .map(({ x, y }) => `${x},${y}`)
          .join(' ')
      "
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
  touch-action: none;
}

.stroke {
  fill: none;
  stroke: currentcolor;
  stroke-width: 3px;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
