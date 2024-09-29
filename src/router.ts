import { createWebHistory, createRouter, RouteLocationRaw } from "vue-router";

export const HOME_ROUTE_NAME = Symbol("home-route-name");
export const KANJI_ROUTE_NAME = Symbol("kanji-route-name");
export const KANJI_LISTS_ROUTE_NAME = Symbol("kanji-lists-route-name");
export const ABOUT_ROUTE_NAME = Symbol("about-route-name");

export const homeRoute: RouteLocationRaw = { name: HOME_ROUTE_NAME };

export const kanjiListsRoute: RouteLocationRaw = {
  name: KANJI_LISTS_ROUTE_NAME,
};

export const aboutRoute: RouteLocationRaw = { name: ABOUT_ROUTE_NAME };

export function kanjiRoute(kanji: string): RouteLocationRaw {
  return { name: KANJI_ROUTE_NAME, params: { kanji } };
}

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: HOME_ROUTE_NAME,
      component: () => import("./views/HomeView.vue"),
    },
    {
      path: "/list",
      name: KANJI_LISTS_ROUTE_NAME,
      component: () => import("./views/KanjiListsView.vue"),
    },
    {
      path: "/kanji/:kanji",
      name: KANJI_ROUTE_NAME,
      component: () => import("./views/KanjiView.vue"),
    },
    {
      path: "/about",
      name: ABOUT_ROUTE_NAME,
      component: () => import("./views/AboutView.vue"),
    },
  ],
});
