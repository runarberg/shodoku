import { liveQueryBroadcaster } from "../helpers/channels.ts";
import { db as openingDb } from "./index.ts";
import { SYNC_LATEST_HASH_KEY } from "./sync.ts";

export async function clearAllStores() {
  const db = await openingDb;

  const tx = db.transaction(db.objectStoreNames, "readwrite");
  for (const storeName of db.objectStoreNames) {
    const store = tx.objectStore(storeName);
    await store.clear();
  }

  localStorage.removeItem(SYNC_LATEST_HASH_KEY);
  liveQueryBroadcaster.postMessage("database-cleared");
}
