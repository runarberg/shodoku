import { liveQueryBroadcaster } from "../helpers/channels.ts";
import { db as openingDb } from "./index.ts";

export async function clearAllStores() {
  const db = await openingDb;

  const tx = db.transaction(db.objectStoreNames, "readwrite");
  for (const storeName of db.objectStoreNames) {
    const store = tx.objectStore(storeName);
    await store.clear();
  }

  liveQueryBroadcaster.postMessage("database-cleared");
}
