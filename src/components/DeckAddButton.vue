<script setup lang="ts">
import AppButton from "./AppButton.vue";
import AppIcon from "./AppIcon.vue";

const props = withDefaults(
  defineProps<{
    added?: boolean;
  }>(),
  {
    added: false,
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
    @click="handleClick"
  >
    <AppIcon icon="plus" />
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
