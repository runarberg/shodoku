import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

import createSvgSpritePlugin from "./vite-plugins/svg-sprite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // treat all tags with a dash as custom elements
          isCustomElement: (tag) => tag.startsWith("c-"),
        },
      },
    }),
    createSvgSpritePlugin("./src/assets/icons/", {
      svgo: {
        plugins: [{ name: "preset-default" }, { name: "removeXMLNS" }],
      },
    }),
  ],

  server: {
    watch: {
      ignored: ["**/public/data/**"],
    },
  },
});
