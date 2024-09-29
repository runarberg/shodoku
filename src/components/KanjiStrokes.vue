<script setup lang="ts">
import { computed, ref, shallowReactive } from "vue";

import { useKanjiVG, useKanjiVGViewBox } from "../helpers/kanjivg";
import { KanjiInfo } from "../types";

import AppButton from "./AppButton.vue";
import AppIcon from "./AppIcon.vue";
import KanjiStrokesBackground from "./KanjiStrokesBackground.vue";
import KanjiStrokesGroup from "./KanjiStrokesGroup.vue";

defineProps<{
  kanji: KanjiInfo;
}>();

const kanjiVG = useKanjiVG();
const viewBox = useKanjiVGViewBox();

const animations = shallowReactive<Animation[]>([]);
const animating = computed(() => animations.length > 0);
const animationPaused = ref(false);

function animate() {
  const strokes = kanjiVG.value?.querySelectorAll("path");

  if (!strokes) {
    return;
  }

  for (const stroke of strokes) {
    const l = stroke.getTotalLength();
    const animation = stroke.animate(
      [
        { strokeDasharray: l, strokeDashoffset: l },
        { strokeDasharray: l, strokeDashoffset: 0 },
      ],
      {
        duration: 500,
        endDelay: 100,
        easing: "ease-in-out",
      }
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

function pauseAnimation() {
  animations.at(0)?.pause();
  animationPaused.value = true;
}

function resumeAnimation() {
  animations.at(0)?.play();
  animationPaused.value = false;
}
</script>

<template>
  <section>
    <h2>Strokes ({{ kanji.strokeCount }})</h2>

    <figure class="strokes-figure">
      <svg v-if="kanjiVG" :viewBox="viewBox" class="svg">
        <KanjiStrokesBackground :viewBox="viewBox" />
        <KanjiStrokesGroup :strokes="kanjiVG" />
      </svg>

      <figcaption class="controls">
        <template v-if="animating">
          <AppButton v-if="animationPaused" @click="resumeAnimation()">
            <AppIcon icon="play" />
          </AppButton>
          <AppButton v-else @click="pauseAnimation()">
            <AppIcon icon="pause" />
          </AppButton>
        </template>

        <AppButton v-else @click="animate()">
          <AppIcon icon="play" />
        </AppButton>
      </figcaption>
    </figure>
  </section>
</template>

<style scoped>
.strokes-figure {
  row-gap: 1ex;
  display: flex;
  flex-direction: column;
  inline-size: max-content;
  margin: 0;

  & .svg {
    block-size: 15em;
  }

  & .controls {
    align-self: center;
  }
}
</style>
