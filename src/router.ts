import { createRouter, createWebHistory, RouteLocationRaw } from "vue-router";

export const HOME_ROUTE_NAME = Symbol("home-route-name");
export const REVIEW_ROUTE_NAME = Symbol("review-route-name");
export const REVIEW_SUMMARY_ROUTE_NAME = Symbol("review-summary-route-name");
export const KANA_ROUTE_NAME = Symbol("kana-route-name");
export const KANJI_ROUTE_NAME = Symbol("kanji-route-name");
export const KANJI_COMPONENT_ROUTE_NAME = Symbol("kanji-component-route-name");
export const WORD_ROUTE_NAME = Symbol("word-route-name");
export const DECKS_ROUTE_NAME = Symbol("decks-route-name");
export const DECK_BROWSER_ROUTE_NAME = Symbol("deck-browser-route-name");
export const DICTIONARY_ROUTE_NAME = Symbol("dictionary-route-name");
export const SETTINGS_ROUTE_NAME = Symbol("settings-route-name");
export const ABOUT_ROUTE_NAME = Symbol("about-route-name");

export const homeRoute: RouteLocationRaw = { name: HOME_ROUTE_NAME };
export const reviewRoute: RouteLocationRaw = { name: REVIEW_ROUTE_NAME };
export const reviewSummaryRoute: RouteLocationRaw = {
  name: REVIEW_SUMMARY_ROUTE_NAME,
};
export const decksRoute: RouteLocationRaw = { name: DECKS_ROUTE_NAME };
export const deckBrowserRoute: RouteLocationRaw = {
  name: DECK_BROWSER_ROUTE_NAME,
};
export const dictionaryRoute: RouteLocationRaw = {
  name: DICTIONARY_ROUTE_NAME,
};
export const settingsRoute: RouteLocationRaw = { name: SETTINGS_ROUTE_NAME };
export const aboutRoute: RouteLocationRaw = { name: ABOUT_ROUTE_NAME };

export function kanaRoute(kana: string): RouteLocationRaw {
  return { name: KANA_ROUTE_NAME, params: { kana } };
}

export function kanjiRoute(kanji: string): RouteLocationRaw {
  return { name: KANJI_ROUTE_NAME, params: { kanji } };
}

export function kanjiComponentRoute(kanjiComponent: string): RouteLocationRaw {
  return { name: KANJI_COMPONENT_ROUTE_NAME, params: { kanjiComponent } };
}

export function wordRoute(wordId: number): RouteLocationRaw {
  return { name: WORD_ROUTE_NAME, params: { wordId: `${wordId}` } };
}

export const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, from, savedPosition) {
    if (to.path === from.path) {
      return;
    }

    if (savedPosition) {
      return savedPosition;
    }

    if (to.hash) {
      return { el: to.hash };
    }

    const appMainEl = document.getElementById("app:main");
    if (appMainEl && appMainEl.getBoundingClientRect().top < 0) {
      return { el: appMainEl };
    }
  },
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
      path: "/review/summary",
      name: REVIEW_SUMMARY_ROUTE_NAME,
      component: () => import("./views/ReviewSummaryView.vue"),
    },
    {
      path: "/kana/:kana",
      name: KANA_ROUTE_NAME,
      components: {
        default: () => import("./views/KanaView.vue"),
        aside: () => import("./views/KanaAsideView.vue"),
      },
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
      path: "/kanji-component/:kanjiComponent",
      name: KANJI_COMPONENT_ROUTE_NAME,
      components: {
        default: () => import("./views/KanjiComponentView.vue"),
      },
    },
    {
      path: "/word/:wordId",
      name: WORD_ROUTE_NAME,
      component: () => import("./views/WordView.vue"),
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
          path: "manage",
          name: DECK_BROWSER_ROUTE_NAME,
          component: () => import("./views/DeckBrowserView.vue"),
        },
      ],
    },
    {
      path: "/dictionary",
      name: DICTIONARY_ROUTE_NAME,
      component: () => import("./views/DictionaryView.vue"),
    },
    {
      path: "/settings",
      name: SETTINGS_ROUTE_NAME,
      component: () => import("./views/SettingsView.vue"),
    },
    {
      path: "/about",
      name: ABOUT_ROUTE_NAME,
      component: () => import("./views/AboutView.vue"),
    },
  ],
});
