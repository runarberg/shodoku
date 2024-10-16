import { createWebHistory, createRouter, RouteLocationRaw } from "vue-router";

export const HOME_ROUTE_NAME = Symbol("home-route-name");
export const REVIEW_ROUTE_NAME = Symbol("review-route-name");
export const KANJI_ROUTE_NAME = Symbol("kanji-route-name");
export const DECKS_ROUTE_NAME = Symbol("decks-route-name");
export const DECK_BROWSER_ROUTE_NAME = Symbol("deck-browser-route-name");
export const ABOUT_ROUTE_NAME = Symbol("about-route-name");

export const homeRoute: RouteLocationRaw = { name: HOME_ROUTE_NAME };
export const reviewRoute: RouteLocationRaw = { name: REVIEW_ROUTE_NAME };
export const decksRoute: RouteLocationRaw = { name: DECKS_ROUTE_NAME };
export const deckBrowserRoute: RouteLocationRaw = {
  name: DECK_BROWSER_ROUTE_NAME,
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
      path: "/review",
      name: REVIEW_ROUTE_NAME,
      component: () => import("./views/ReviewView.vue"),
    },
    {
      path: "/kanji/:kanji",
      name: KANJI_ROUTE_NAME,
      components: {
        default: () => import("./views/KanjiView.vue"),
        aside: () => import("./views/KanjiAsideView.vue"),
      },
    },
    {
      path: "/decks",
      children: [
        {
          path: "",
          name: DECKS_ROUTE_NAME,
          component: () => import("./views/DecksView.vue"),
        },
        {
          path: "add",
          name: DECK_BROWSER_ROUTE_NAME,
          component: () => import("./views/DeckBrowserView.vue"),
        },
      ],
    },
    {
      path: "/about",
      name: ABOUT_ROUTE_NAME,
      component: () => import("./views/AboutView.vue"),
    },
  ],
});
