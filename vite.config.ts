import { serwist } from "@serwist/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

import createSvgSpritePlugin from "./vite-plugins/svg-sprite";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true,
  },

  plugins: [
    vue({
      template: {
        compilerOptions: {
          // treat all tags with a dash as custom elements
          isCustomElement: (tag) => tag.startsWith("c-"),
        },
      },
    }),

    serwist({
      swSrc: "src/sw.ts",
      swDest: "sw.js",
      injectionPoint: "self.__SW_MANIFEST",

      globDirectory: "dist",
      globPatterns: [
        "index.html",
        "assets/**/*.{html,css,js,svg}",
        "robots.txt",
        "favicon.ico",
        "icon*.{png,svg}",
        "apple-touch-icon.png",
        "manifest.json",
      ],
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
