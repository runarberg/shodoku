<script setup lang="ts">
import AppButton from "./AppButton.vue";
import AppIcon from "./AppIcon.vue";
import AppLoading from "./AppLoading.vue";

const props = withDefaults(
  defineProps<{
    added?: boolean;
    adding?: boolean;
  }>(),
  {
    added: false,
    adding: false,
  }
);

const emit = defineEmits<{
  add: [];
  remove: [];
}>();

function handleClick() {
  if (props.added) {
    emit("remove");
  } else {
    emit("add");
  }
}
</script>

<template>
  <AppButton
    :aria-label="added ? 'Remove Deck' : 'Add Deck'"
    class="add-button"
    :filled="added"
    :disabled="adding"
    @click="handleClick"
  >
    <AppLoading v-if="adding" />
    <AppIcon v-else icon="plus" />
  </AppButton>
</template>

<style scoped>
.add-button {
  background: none;
  border-width: 2px;
  padding: 0.5ex;
  font-size: 0.8em;
}
</style>
