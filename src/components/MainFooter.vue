<script setup lang="ts">
import { ABOUT_ROUTE_NAME, aboutRoute } from "../router.ts";

const currentYear = new Date().getFullYear();
</script>

<template>
  <footer>
    <nav class="footer-nav">
      <ul>
        <li>
          <RouterLink class="link" :to="aboutRoute"> About </RouterLink>
        </li>

        <li>
          <RouterLink
            class="link"
            :to="{ name: ABOUT_ROUTE_NAME, hash: '#section:data-sources' }"
          >
            Data Sources
          </RouterLink>
        </li>
      </ul>
    </nav>

    <p class="copyright">
      <small>
        Shodoku uses the
        <a
          href="https://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project"
          >JMdict/EDICT
        </a>
        and
        <a href="https://www.edrdg.org/wiki/index.php/KANJIDIC_Project"
          >KANJIDIC
        </a>
        dictionary files. These files are the property of the
        <a href="https://www.edrdg.org/">
          Electronic Dictionary Research and Development Group</a
        >, and are used in conformance with the Group's
        <a href="https://www.edrdg.org/edrdg/licence.html">licence</a>.
      </small>
    </p>

    <p class="copyright">
      <small
        >© 2024-{{ currentYear }} Rúnar Berg Baugsson Sigríðarson.
        <a
          href="https://github.com/runarberg/shodoku/blob/main/LICENSE.txt"
          target="_blank"
          class="link"
          >MIT License</a
        ></small
      >.
    </p>
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

p.copyright {
  margin-block: 0.5em;

  & a {
    color: var(--accent-color);
    text-decoration: none;
  }
}

.link {
  color: var(--accent-color);
  text-decoration: none;
}
</style>
