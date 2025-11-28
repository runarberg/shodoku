<template>
  <span class="app-label"><slot /></span>
</template>

<style scoped>
.app-label {
  align-items: center;
  border-radius: 1ex;
  display: flex;
  font-size: 0.65em;
  font-weight: 600;
  padding: 0.5ex 1ex;
}

:slotted(a) {
  color: inherit;
  text-decoration: none;
}
</style>
