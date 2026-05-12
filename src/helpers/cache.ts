export async function clearCaches() {
  for (const cache of await globalThis.caches.keys()) {
    if (cache.startsWith("shodoku-")) {
      await caches.delete(cache);
    }
  }
}
