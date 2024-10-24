<script setup lang="ts">
import { computed, ref, shallowReactive, watch } from "vue";

import {
  useKanjiVG,
  useKanjiVGSyncing,
  useKanjiVGViewBox,
} from "../helpers/kanjivg";
import { KanjiInfo } from "../types";

import AppButton from "./AppButton.vue";
import AppIcon from "./AppIcon.vue";
import KanjiStrokesBackground from "./KanjiStrokesBackground.vue";
import KanjiStrokesGroup from "./KanjiStrokesGroup.vue";
import KanjiStrokesPracticeCanvas from "./KanjiStrokesPracticeCanvas.vue";
import { sleep } from "../helpers/time";
import { until } from "@vueuse/core";

const props = withDefaults(
  defineProps<{
    kanji: KanjiInfo;
    autoHint?: boolean;
    practiceMode?: boolean;
    practiceReview?: boolean;
  }>(),
  {
    autoHint: false,
    practiceReview: false,
    practiceMode: false,
  }
);

const emit = defineEmits<{
  practiceDone: [];
}>();

const svgEl = ref<SVGSVGElement | null>(null);
const kanjiVG = useKanjiVG();
const viewBox = useKanjiVGViewBox();
const isKanjiVGSyncing = useKanjiVGSyncing();

const strokes = computed(() => kanjiVG.value?.querySelectorAll("path") ?? []);

const animations = shallowReactive<Animation[]>([]);
const animating = computed(() => animations.length > 0);
const animationPaused = ref(false);

const practicing = ref(false);
const practiceStrokes = shallowReactive<string[]>([]);
const lastPracticed = ref<number | null>(null);

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

function animate() {
  for (const stroke of strokes.value) {
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

    if (animation) {
      await sleep(100);
    }
  }
}

function pauseAnimation() {
  animations.at(0)?.pause();
  animationPaused.value = true;
}

function resumeAnimation() {
  animations.at(0)?.play();
  animationPaused.value = false;
}

function showHint(n = practiceStrokes.length) {
  const stroke = strokes.value[n];

  if (!stroke) {
    return;
  }

  stroke.style.display = "block";

  const animation = stroke.animate(
    strokeKeyframes(stroke),
    strokeAnimationOptions
  );

  animation.play();

  animation.finished.then(() => {
    stroke.style.removeProperty("display");
  });
}

function pushPracticeStroke(d: string) {
  practiceStrokes.push(d);

  if (props.practiceMode && practiceStrokes.length === strokes.value.length) {
    lastPracticed.value = props.kanji.codepoint;
    emit("practiceDone");
  }

  if (
    props.practiceMode &&
    props.autoHint &&
    practiceStrokes.length < strokes.value.length
  ) {
    showHint();
  }
}

watch(practicing, (practiceStarted) => {
  if (practiceStarted) {
    // Clear any ongoing animation
    for (const animation of animations) {
      animation.cancel();
    }
    animations.splice(0, animations.length);
    animationPaused.value = false;
  } else {
    // Practice ended. Clear they practice strokes.
    practiceStrokes.splice(0, practiceStrokes.length);
  }
});

watch(
  () => props.practiceMode,
  (isPracticeMode) => {
    for (const stroke of strokes.value) {
      for (const animation of stroke.getAnimations()) {
        animation.cancel();
      }
    }

    if (
      isPracticeMode !== practicing.value &&
      !(props.practiceReview && lastPracticed.value === props.kanji.codepoint)
    ) {
      practicing.value = isPracticeMode;
    }
  },
  { immediate: true }
);

watch(
  () => props.autoHint,
  (isAutoHint) => {
    if (isAutoHint) {
      requestAnimationFrame(async () => {
        await until(isKanjiVGSyncing).toBe(false);
        showHint(0);
      });
    }
  },
  { immediate: true }
);

watch(
  () => props.kanji.codepoint,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      // We have a new kanji. Clear the practice strokes.
      practiceStrokes.splice(0, practiceStrokes.length);
    }
  }
);
</script>

<template>
  <section>
    <h2>
      Strokes
      <template v-if="!practiceMode && strokes.length > 0">
        ({{ strokes.length }})
      </template>
    </h2>

    <figure class="strokes-figure">
      <svg v-if="kanjiVG" ref="svgEl" :viewBox="viewBox" class="svg">
        <KanjiStrokesBackground :viewBox="viewBox" />

        <KanjiStrokesGroup
          :strokes="kanjiVG"
          class="strokes"
          :class="{
            comparing: animating || strokes.length <= practiceStrokes.length,
            practicing,
          }"
        />

        <KanjiStrokesPracticeCanvas
          v-if="practicing"
          :practice-strokes="practiceStrokes"
          :animate="animating"
          :animate-pause="animationPaused"
          @stroke="pushPracticeStroke($event)"
        />
      </svg>

      <figcaption class="controls">
        <template v-if="animating">
          <Appbutton
            v-if="animationPaused"
            aria-label="Play"
            @click="resumeAnimation()"
          >
            <AppIcon icon="play" />
          </Appbutton>

          <AppButton v-else aria-label="Pause" @click="pauseAnimation()">
            <AppIcon icon="pause" />
          </AppButton>
        </template>

        <template v-else>
          <AppButton
            v-if="practicing && practiceStrokes.length < strokes.length"
            aria-label="Show Hint"
            @click="showHint()"
          >
            <AppIcon icon="help-circle" />
          </AppButton>
          <AppButton
            v-else
            aria-label="Animate Stroke Order"
            @click="animate()"
          >
            <AppIcon icon="play" />
          </AppButton>
        </template>

        <AppButton
          v-if="!practiceMode"
          aria-lable="Practice Drawing"
          :aria-pressed="`${practicing}`"
          :filled="practicing"
          @click="practicing = !practicing"
        >
          <AppIcon icon="draw" />
        </AppButton>

        <template v-if="practicing">
          <hr class="rule" />

          <AppButton aria-label="Undo" @click="practiceStrokes.pop()">
            <AppIcon icon="rotate-left" />
          </AppButton>
        </template>
      </figcaption>
    </figure>
  </section>
</template>

<style scoped>
.strokes-figure {
  display: grid;
  grid-template:
    "svg . controls ."
    / minmax(15em, 25em) 1ex auto minmax(0, 1fr);
  margin: 0;

  & .svg {
    grid-area: svg;
    max-inline-size: 100%;

    & .strokes.practicing :deep(path) {
      color: var(--light-gray);
      display: none;
    }

    & .strokes.practicing.comparing :deep(path) {
      display: block;
    }
  }

  & .controls {
    align-self: start;
    display: flex;
    flex-direction: column;
    grid-area: controls;
    row-gap: 1ex;

    & .rule {
      background: var(--accent-color);
      block-size: 1px;
      border: none;
      inline-size: 100%;
    }
  }
}
</style>
