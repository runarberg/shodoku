<script setup lang="ts">
import AppButton from "./AppButton.vue";

const props = withDefaults(
  defineProps<{
    isActive?: boolean;
    toggling?: boolean;
  }>(),
  {
    isActive: false,
    toggling: false,
  }
);

const emit = defineEmits<{
  activate: [];
  deactivate: [];
}>();

function handleClick() {
  if (props.isActive) {
    emit("deactivate");
  } else {
    emit("activate");
  }
}
</script>

<template>
  <AppButton
    class="activate-button"
    :filled="isActive"
    :disabled="toggling"
    :prefix-icon="toggling ? undefined : isActive ? 'checkmark' : 'plus'"
    :aria-pressed="isActive"
    @click="handleClick"
  >
    <template v-if="toggling">
      <span class="loading-icon">時</span> Loading
    </template>
    <template v-else-if="isActive">Active</template>
    <template v-else>Add</template>
  </AppButton>
</template>

<style scoped>
.activate-button {
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
