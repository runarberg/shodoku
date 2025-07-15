<script setup lang="ts">
import AppButton from "./AppButton.vue";
import AppIcon from "./AppIcon.vue";
import AppInput from "./AppInput.vue";

const model = defineModel<[string, string][]>({
  required: true,
});

function setHeader(index: number, value: [string, string]) {
  model.value = model.value.with(index, value);
}

function deleteHeader(index: number) {
  model.value = model.value.toSpliced(index, 1);
}

function addHeader() {
  model.value = [...model.value, ["", ""]];
}
</script>

<template>
  <fieldset>
    <legend>Headers</legend>

    <ul class="header-list">
      <li v-for="([key, value], i) of model" :key="i" class="header-list-item">
        <AppInput
          :model-value="key"
          label="Key"
          inline
          @input="setHeader(i, [$event.target.value.toUpperCase(), value])"
        />

        <AppInput
          :model-value="value"
          label="Value"
          inline
          @input="setHeader(i, [key, $event.target.value])"
        />

        <AppButton
          type="button"
          class="remove-header-button"
          @click="deleteHeader(i)"
        >
          <AppIcon icon="delete" />
        </AppButton>
      </li>
    </ul>

    <AppButton
      class="add-header-button"
      type="button"
      prefix-icon="plus"
      @click="addHeader()"
    >
      Add Header
    </AppButton>
  </fieldset>
</template>

<style scoped>
.header-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.header-list-item {
  column-gap: 1ex;
  display: flex;

  & .app-form-field,
  & :deep(.input) {
    flex-grow: 1;
  }
}

.remove-header-button {
  background: none;
  border: 0;
}

.add-header-button {
  font-size: 0.85em;
  margin-block-start: 1ex;
}
</style>
