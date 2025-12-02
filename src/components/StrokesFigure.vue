<script lang="ts" setup>
import { computed, ref, shallowReactive, watch } from "vue";

import { sleep } from "../helpers/time.ts";
import AppButton from "./AppButton.vue";
import AppIcon from "./AppIcon.vue";
import KanjiStrokesBackground from "./KanjiStrokesBackground.vue";
import KanjiStrokesPracticeCanvas from "./KanjiStrokesPracticeCanvas.vue";

const practicing = defineModel<boolean>("practicing", { default: false });
const autoHint = defineModel<boolean>("auto-hint", { default: false });

const props = withDefaults(
  defineProps<{
    charStrokes: string[][];
    viewBox?: string;
    practiceMode?: boolean;
  }>(),
  {
    viewBox: "0,0,109,109",
    practiceMode: false,
  },
);

const emit = defineEmits<{
  practiceDone: [];
}>();

const strokePaths = ref<SVGPathElement[]>([]);
const practiceCanvases = ref<
  Array<InstanceType<typeof KanjiStrokesPracticeCanvas>>
>([]);

const animations = shallowReactive<Animation[]>([]);
const animating = computed(() => animations.length > 0);
const animationPaused = ref(false);

const comparing = ref(false);

const strokes = computed(() => props.charStrokes.flat());

const practiceStrokeSequence = shallowReactive<number[]>([]);
const practiceStrokeCount = computed(() => practiceStrokeSequence.length);

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
  for (const path of strokePaths.value) {
    const animation = path.animate(
      strokeKeyframes(path),
      strokeAnimationOptions,
    );

    animation.pause();
    animations.push(animation);
  }

  playAnimations();
  playPracticeAnimations();
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

async function playPracticeAnimations() {
  for (const canvas of practiceCanvases.value) {
    canvas.prepareForAnimation();
  }

  for (const canvas of practiceCanvases.value) {
    await canvas.animate();
    await sleep(100);
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

function handleNewPracticeStroke(i: number) {
  practiceStrokeSequence.push(i);

  const count = practiceStrokeCount.value;

  if (props.practiceMode && count === strokes.value.length) {
    emit("practiceDone");
  }

  if (props.practiceMode && autoHint.value && count < strokes.value.length) {
    showHint();
  }
}

function findNextStroke() {
  if (practiceStrokeCount.value >= strokes.value.length) {
    return null;
  }

  const counts = Array.from({ length: props.charStrokes.length }, () => 0);
  for (const index of practiceStrokeSequence) {
    counts[index] += 1;
  }

  let path: string | undefined;
  let index = -1;
  for (const paths of props.charStrokes) {
    index += 1;
    path = paths.at(counts[index]);

    if (path) {
      break;
    }
  }

  if (!path) {
    return null;
  }

  const canvas = practiceCanvases.value.at(index);

  if (!canvas) {
    return null;
  }

  return { path, canvas, index };
}

function showHint() {
  const next = findNextStroke();

  if (!next) {
    return;
  }

  const { path, canvas } = next;
  canvas.hint(path);
}

function pushPracticeStroke() {
  const next = findNextStroke();

  if (!next) {
    return;
  }

  const { path, canvas, index } = next;

  canvas.push(path);
  handleNewPracticeStroke(index);
}

function popPracticeStroke() {
  const lastIndex = practiceStrokeSequence.pop();

  if (lastIndex != null) {
    practiceCanvases.value.at(lastIndex)?.pop();
  }
}

function clearPracticeStrokes() {
  for (const canvas of practiceCanvases.value) {
    canvas.clear();
  }

  practiceStrokeSequence.splice(0, practiceStrokeSequence.length);
  comparing.value = false;
}

function clearAnimations() {
  for (const animation of animations) {
    animation.cancel();
  }
  animations.splice(0, animations.length);
  animationPaused.value = false;

  for (const path of strokePaths.value) {
    for (const animation of path.getAnimations()) {
      animation.cancel();
    }
  }
}

watch(practicing, (practiceStarted) => {
  comparing.value = false;

  if (practiceStarted) {
    clearAnimations();
  } else {
    clearPracticeStrokes();
  }
});

watch(
  () => props.practiceMode,
  (isPracticeMode, wasPracticeMode) => {
    if (isPracticeMode === false && wasPracticeMode === true) {
      // Practice is done.
      if (practiceStrokeCount.value === 0) {
        // User may be using a pen and paper, just show the answer.
        practicing.value = false;
      } else if (practiceStrokeCount.value < strokes.value.length) {
        // User clicked the “show answer” button before they finished
        // writing out the character.
        comparing.value = true;
      }
    }
  },
);

watch(
  strokes,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      // We have a new kanji.
      clearPracticeStrokes();
      clearAnimations();
      comparing.value = false;

      if (practicing.value !== props.practiceMode) {
        // And maybe toggle the practice mode.
        practicing.value = props.practiceMode;
      }

      if (autoHint.value) {
        requestAnimationFrame(async () => {
          showHint();
        });
      }
    }
  },
  { immediate: true },
);
</script>

<template>
  <figure class="strokes-figure">
    <div class="svgs">
      <svg
        v-for="(paths, i) of charStrokes"
        :key="i"
        class="svg"
        :class="{ practicing }"
        :viewBox="viewBox"
        @touchstart="
          if (practicing) {
            $event.preventDefault();
          }
        "
      >
        <KanjiStrokesBackground :viewBox="viewBox" />

        <g
          class="strokes"
          :class="{
            comparing:
              animating || comparing || strokes.length <= practiceStrokeCount,
            practicing,
          }"
        >
          <path
            v-for="(path, j) of paths"
            :key="j"
            ref="strokePaths"
            class="stroke-path"
            :d="path"
          />
        </g>

        <KanjiStrokesPracticeCanvas
          v-if="practicing"
          ref="practiceCanvases"
          :animate-pause="animationPaused"
          @stroke="handleNewPracticeStroke(i)"
        />
      </svg>
    </div>

    <figcaption class="controls">
      <template v-if="animating">
        <AppButton
          v-if="animationPaused"
          aria-label="Play"
          @click="resumeAnimation()"
        >
          <AppIcon icon="play" />
        </AppButton>

        <AppButton v-else aria-label="Pause" @click="pauseAnimation()">
          <AppIcon icon="pause" />
        </AppButton>
      </template>

      <template v-else>
        <AppButton
          v-if="practicing && practiceStrokeCount < strokes.length"
          aria-label="Show Hint"
          @click="showHint()"
        >
          <AppIcon icon="help-circle" />
        </AppButton>

        <AppButton v-else aria-label="Animate Stroke Order" @click="animate()">
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

        <AppButton
          aria-label="Start Over"
          :disabled="practiceStrokeCount === 0"
          @click="clearPracticeStrokes()"
        >
          <AppIcon icon="rotate-left" />
        </AppButton>

        <AppButton
          aria-label="Skip Backward"
          :disabled="practiceStrokeCount === 0"
          @click="popPracticeStroke()"
        >
          <AppIcon icon="skip-backward" />
        </AppButton>

        <AppButton
          aria-label="Skip Backward"
          :disabled="practiceStrokeCount === strokes.length"
          @click="pushPracticeStroke()"
        >
          <AppIcon icon="skip-forward" />
        </AppButton>
      </template>
    </figcaption>
  </figure>
</template>

<style scoped>
.strokes-figure {
  display: grid;
  grid-template:
    "svgs . controls ."
    / minmax(15em, 25em) 1ex auto minmax(0, 1fr);
  margin: 0;
}

.svgs {
  align-items: start;
  column-gap: 3px;
  grid-area: svgs;
  display: flex;
}

.svg {
  touch-action: manipulation;
  max-inline-size: 100%;

  &.practicing {
    touch-action: none;
  }

  & .strokes.practicing :deep(path) {
    color: light-dark(var(--light-gray), var(--dark-gray));
    display: none;
  }

  & .strokes.practicing.comparing :deep(path) {
    display: block;
  }
}

.stroke-path {
  fill: none;
  stroke: currentcolor;
  stroke-width: 3px;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.controls {
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
</style>
