<script setup lang="ts">
import { ABOUT_ROUTE_NAME, aboutRoute } from "../router";

const currentYear = new Date().getFullYear();
</script>

<template>
  <footer>
    <nav class="footer-nav">
      <ul>
        <li>
          <RouterLink class="footer-link" :to="aboutRoute">About</RouterLink>
        </li>

        <li>
          <RouterLink
            class="footer-link"
            :to="{ name: ABOUT_ROUTE_NAME, hash: '#section:data-sources' }"
          >
            Data Sources
          </RouterLink>
        </li>
      </ul>
    </nav>

    <small class="copyright"
      >© 2024-{{ currentYear }} Rúnar Berg Baugsson Sigríðarson.
      <a
        href="https://github.com/runarberg/shodoku/blob/main/LICENSE.txt"
        target="_blank"
        >MIT License</a
      ></small
    >
  </footer>
</template>

<style scoped>
.footer-nav > ul {
  column-gap: 1ex;
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;

  & > li {
    align-items: center;
    display: flex;
  }
  & > li:not(:first-child)::before {
    background: var(--accent-color);
    block-size: 1em;
    content: "";
    display: block;
    inline-size: 1px;
    margin-inline-end: 1ex;
  }
}

.footer-nav .footer-link {
  color: var(--accent-color);
  text-decoration: none;
}
</style>
