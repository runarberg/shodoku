<script setup lang="ts">
import { computed } from "vue";
import { pipe } from "yta";
import { filter, map, toArray, unique } from "yta/sync";

import { isKanji } from "../helpers/text.ts";

import AppButton from "./AppButton.vue";
import AppInput from "./AppInput.vue";
import AppNumberInput from "./AppNumberInput.vue";
import AppTextArea from "./AppTextArea.vue";

const label = defineModel<string>("label");
const priority = defineModel<number>("priority");
const cards = defineModel<number[]>("cards");

withDefaults(
  defineProps<{
    labelFieldDisabled?: boolean;
    priorityFieldDisabled?: boolean;
    confirmIcon?: string;
    confirmLabel?: string;
  }>(),
  {
    labelFieldDisabled: false,
    priorityFieldDisabled: false,
    confirmLabel: "confirm",
  }
);

defineEmits<{
  submit: [];
  reset: [];
}>();

const kanji = computed({
  get() {
    if (!cards.value) {
      return "";
    }

    return cards.value
      .map((codePoint) => String.fromCodePoint(codePoint))
      .join("");
  },

  set(value: string) {
    cards.value = pipe(
      value,
      filter(isKanji),
      map((char) => char.codePointAt(0) as number),
      unique(),
      toArray()
    );
  },
});
</script>

<template>
  <form @submit.prevent="$emit('submit')" @reset="$emit('reset')">
    <div class="form-body">
      <AppInput
        v-model="label"
        class="name-field"
        label="Deck Name"
        :disabled="labelFieldDisabled"
        required
      />

      <AppNumberInput
        v-model="priority"
        class="priority-field"
        label="Priority"
        min="1"
        :disabled="priorityFieldDisabled"
        required
      />

      <AppTextArea
        v-model="kanji"
        class="kanji-field"
        label="Kanji"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        placeholder="Type or paste in your kanji here: 日月火時漢字読書"
      />
    </div>

    <div class="buttons">
      <AppButton type="reset">Cancel</AppButton>
      <AppButton type="submit" :prefix-icon="confirmIcon" filled>
        {{ confirmLabel }}
      </AppButton>
    </div>
  </form>
</template>

<style scoped>
.form-body {
  display: grid;
  gap: 1em;
  grid-template:
    "name priority"
    "kanji kanji"
    / 3fr 1fr;

  & .name-field {
    grid-area: name;
  }

  & .priority-field {
    grid-area: priority;
  }

  & .kanji-field {
    grid-area: kanji;

    & :deep(textarea) {
      min-block-size: 5em;
    }
  }

  @media screen and (max-width: 60ch) {
    display: flex;
    flex-direction: column;
  }
}

.buttons {
  column-gap: 1ex;
  display: flex;
  margin-block-start: 1em;
  justify-content: end;
}
</style>
