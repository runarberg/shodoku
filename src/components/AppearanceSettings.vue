<script setup lang="ts">
import { colorModePreference as colorMode } from '../store/preferences.ts';
</script>

<template>
  <div class="fields">
    <fieldset class="color-mode-fieldset">
      <legend>Color Mode</legend>

      <div class="fieldset-body">
      <label>
        <input v-model="colorMode" type="radio" name="color-mode" value="light dark" />
        <span class="label">System</span>
      </label>

      <label>
        <input v-model="colorMode" type="radio" name="color-mode" value="light" />
        <span class="label">Light</span>
      </label>

      <label>
        <input v-model="colorMode" type="radio" name="color-mode" value="dark" />
        <span class="label">Dark</span>
      </label>
      </div>
    </fieldset>
  </div>
</template>

<style scoped>
.fieldset-body {
  display: flex;
  flex-flow: column;
}
</style>
