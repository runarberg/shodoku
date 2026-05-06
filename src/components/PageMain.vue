<template>
  <main class="page-main">
    <slot />
  </main>
</template>

<style scoped>
.page-main {
  background: var(--background-content);
  border-radius: 1ex;
  max-inline-size: 90ch;
  padding: 1em;
}
</style>
