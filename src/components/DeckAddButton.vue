<script setup lang="ts">
import AppButton from "./AppButton.vue";
import AppIcon from "./AppIcon.vue";

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
    <span class="loading-icon" v-if="adding">時</span>
    <AppIcon v-else icon="plus" />
  </AppButton>
</template>

<style scoped>
.add-button {
  background: none;
  border-width: 2px;
  padding: 0.5ex;
  font-size: 0.8em;

  & .loading-icon {
    animation: fade-in-out 2s ease-in-out alternate both infinite;
    font-weight: 700;
  }
}

@keyframes fade-in-out {
  from {
    opacity: 0.2;
  }

  to {
    opacity: 1;
  }
}
</style>
