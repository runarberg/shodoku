import {
  CacheFirst,
  CacheWillUpdateCallbackParam,
  ExpirationPlugin,
  type PrecacheEntry,
  Route,
  Serwist,
  type SerwistGlobalConfig,
  SerwistPlugin,
  StaleWhileRevalidate,
} from "serwist";

import { MONTH } from "./helpers/time.ts";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

type CacheableResponsePluginOptions = {
  statuses: number[];
  headers: HeadersInit;
};

class CacheableResponsePlugin implements SerwistPlugin {
  #statuses: number[];
  #headers?: Headers;

  constructor({ statuses = [200], headers }: CacheableResponsePluginOptions) {
    this.#statuses = statuses;

    if (headers) {
      this.#headers = new Headers(headers);
    }
  }

  async cacheWillUpdate({
    response,
  }: CacheWillUpdateCallbackParam): Promise<Response | null> {
    if (!this.#statuses.includes(response.status)) {
      return null;
    }

    if (!this.#headers) {
      return response;
    }

    for (const [key, value] of this.#headers) {
      if (!response.headers.get(key)?.startsWith(value)) {
        return null;
      }
    }

    return response;
  }
}

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
});

const jsonHeaders = new Headers([["Content-Type", "application/json"]]);
const svgHeaders = new Headers([["Content-Type", "image/svg+xml"]]);

serwist.registerRoute(
  new Route(
    ({ url, sameOrigin }) =>
      sameOrigin &&
      url.pathname.startsWith("/data/index/") &&
      url.pathname.endsWith(".usv"),

    new StaleWhileRevalidate({
      cacheName: "shodoku-data-index",
      plugins: [
        new ExpirationPlugin({
          maxAgeSeconds: MONTH,
          maxAgeFrom: "last-used",
          maxEntries: 10,
        }),
      ],
    }),
  ),
);

serwist.registerRoute(
  new Route(
    ({ url, sameOrigin }) =>
      sameOrigin &&
      url.pathname.startsWith("/data/kanji-lists/") &&
      url.pathname.endsWith(".csv"),

    new StaleWhileRevalidate({
      cacheName: "shodoku-data-kanji-lists",
      plugins: [
        new ExpirationPlugin({
          maxAgeSeconds: MONTH,
          maxAgeFrom: "last-used",
          maxEntries: 100,
        }),
      ],
    }),
  ),
);

serwist.registerRoute(
  new Route(
    ({ url, sameOrigin }) =>
      sameOrigin &&
      url.pathname.startsWith("/data/component-v1/") &&
      url.pathname.endsWith(".json"),

    new CacheFirst({
      cacheName: "shodoku-data-components-v1",
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
          headers: jsonHeaders,
        }),
        new ExpirationPlugin({
          maxAgeSeconds: 3 * MONTH,
          maxAgeFrom: "last-used",
          maxEntries: 500,
        }),
      ],
    }),
  ),
);

serwist.registerRoute(
  new Route(
    ({ url, sameOrigin }) =>
      sameOrigin &&
      url.pathname.startsWith("/data/kanji-v1/") &&
      url.pathname.endsWith(".json"),

    new CacheFirst({
      cacheName: "shodoku-data-kanji-v1",
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
          headers: jsonHeaders,
        }),
        new ExpirationPlugin({
          maxAgeSeconds: 3 * MONTH,
          maxAgeFrom: "last-used",
          maxEntries: 2000,
        }),
      ],
    }),
  ),
);

serwist.registerRoute(
  new Route(
    ({ url, sameOrigin }) =>
      sameOrigin &&
      url.pathname.startsWith("/data/kana-v1/") &&
      url.pathname.endsWith(".json"),

    new CacheFirst({
      cacheName: "shodoku-data-kana-v1",
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
          headers: jsonHeaders,
        }),
        new ExpirationPlugin({
          maxAgeSeconds: 3 * MONTH,
          maxAgeFrom: "last-used",
        }),
      ],
    }),
  ),
);

serwist.registerRoute(
  new Route(
    ({ url, sameOrigin }) =>
      sameOrigin &&
      url.pathname.startsWith("/kanjivg/kanji/") &&
      url.pathname.endsWith(".svg"),
    new CacheFirst({
      cacheName: "shodoku-kanjivg",
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
          headers: svgHeaders,
        }),
        new ExpirationPlugin({
          maxAgeSeconds: 3 * MONTH,
          maxAgeFrom: "last-used",
          maxEntries: 2000,
        }),
      ],
    }),
  ),
);

serwist.registerRoute(
  new Route(
    ({ url, sameOrigin }) =>
      sameOrigin &&
      url.pathname.startsWith("/data/words-v1/") &&
      url.pathname.endsWith(".json"),

    new CacheFirst({
      cacheName: "shodoku-data-words-v1",
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
          headers: jsonHeaders,
        }),
        new ExpirationPlugin({
          maxAgeSeconds: 3 * MONTH,
          maxAgeFrom: "last-used",
          maxEntries: 5000,
          purgeOnQuotaError: true,
        }),
      ],
    }),
  ),
);

serwist.registerRoute(
  new Route(
    ({ url, sameOrigin }) =>
      sameOrigin &&
      url.pathname.startsWith("/data/kanji-vocab-v1/") &&
      url.pathname.endsWith(".json"),

    new CacheFirst({
      cacheName: "shodoku-data-kanji-vocab-v1",
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
          headers: jsonHeaders,
        }),
        new ExpirationPlugin({
          maxAgeSeconds: 3 * MONTH,
          maxAgeFrom: "last-used",
          maxEntries: 500,
          purgeOnQuotaError: true,
        }),
      ],
    }),
  ),
);

serwist.registerRoute(
  new Route(
    ({ url, sameOrigin }) =>
      sameOrigin &&
      url.pathname.startsWith("/data/sentences-v1/") &&
      url.pathname.endsWith(".json"),

    new CacheFirst({
      cacheName: "shodoku-data-sentences-v1",
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
          headers: jsonHeaders,
        }),
        new ExpirationPlugin({
          maxAgeSeconds: 3 * MONTH,
          maxAgeFrom: "last-used",
          maxEntries: 3000,
          purgeOnQuotaError: true,
        }),
      ],
    }),
  ),
);

serwist.registerRoute(
  new Route(
    ({ url, sameOrigin }) =>
      sameOrigin &&
      url.pathname.startsWith("/data/words-sentences-v1/") &&
      url.pathname.endsWith(".json"),

    new CacheFirst({
      cacheName: "shodoku-data-words-sentences-v1",
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
          headers: jsonHeaders,
        }),
        new ExpirationPlugin({
          maxAgeSeconds: 3 * MONTH,
          maxAgeFrom: "last-used",
          maxEntries: 1000,
          purgeOnQuotaError: true,
        }),
      ],
    }),
  ),
);

serwist.addEventListeners();
