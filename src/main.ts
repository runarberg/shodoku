import "./style.css";

import { createPinia } from "pinia";
import { createApp } from "vue";

import App from "./App.vue";
import { router } from "./router.ts";

createApp(App).use(router).use(createPinia()).mount("#app");
