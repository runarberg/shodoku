<script lang="ts" setup="setup">
import { useId } from "vue";
import sprite from "virtual:svg-sprite";

withDefaults(
  defineProps<{
    icon: string;
    title?: string;
    description?: string;
  }>(),
  {
    title: "",
    description: "",
  }
);

const id = useId();
</script>

<template>
  <svg
    :data-icon="icon"
    :aria-hidden="!title && !description"
    :aria-labelledby="`${id}/title`"
    :aria-describedby="`${id}/desc`"
    class="app-icon"
    preserveAspectRatio="xMidYMid meet"
  >
    <title v-if="title" :id="`${id}/title`">{{ title }}</title>
    <desc v-if="description" :id="`${id}/desc`">{{ description }}</desc>
    <use :href="`${sprite}#${icon}`" />
  </svg>
</template>

<style scoped>
.app-icon {
  block-size: 1em;
  fill: currentcolor;
  inline-size: 1em;
}
</style>
