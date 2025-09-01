import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst } from "workbox-strategies";

declare let self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

registerRoute(
  ({ url, sameOrigin }) => {
    if (!sameOrigin) {
      return false;
    }

    return (
      url.pathname.startsWith("/data/") || url.pathname.startsWith("/kanjivg/")
    );
  },

  new CacheFirst({
    cacheName: "shodoku-data-v1",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
);
