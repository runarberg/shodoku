<script setup lang="ts">
import PreferencesForm from "../components/PreferencesForm.vue";
import RemoteSyncSettings from "../components/RemoteSyncSettings.vue";
</script>

<template>
  <article class="settings-view">
    <section>
      <h2>Preferences</h2>

      <PreferencesForm />
    </section>

    <section>
      <h2>Remote Sync</h2>

      <RemoteSyncSettings />
    </section>
  </article>
</template>
