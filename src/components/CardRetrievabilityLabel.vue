<script lang="ts" setup>
import { computed } from "vue";

import { formatPercent } from "../helpers/formats.ts";
import { type CardRetrievability } from "../helpers/fsrs.ts";
import AppLabel from "./AppLabel.vue";

const props = defineProps<{
  r?: CardRetrievability;
  label?: string;
}>();

const grade = computed<"good" | "fair" | "poor">(() => {
  if (typeof props.r !== "number") {
    return "poor";
  }

  if (props.r > 0.9) {
    return "good";
  }

  if (props.r > 0.7) {
    return "fair";
  }

  return "poor";
});
</script>

<template>
  <AppLabel
    v-if="r"
    class="card-retrievability-label"
    title="Writing Retrievability"
    :data-r="grade"
  >
    <span class="prefix">
      <slot name="label">{{ label }}</slot>
    </span>

    <template v-if="typeof r === 'number'">
      {{ formatPercent(r) }}
    </template>

    <template v-else>{{ r }}</template>
  </AppLabel>
</template>

<style scoped>
.card-retrievability-label {
  column-gap: 0.5ex;
  color: var(--background-strong);

  &[data-r="good"] {
    background: var(--green);
  }

  &[data-r="fair"] {
    background: var(--gold);
  }

  &[data-r="poor"] {
    background: var(--orange);
  }
}

.prefix {
  line-height: 1.2;
}
</style>
