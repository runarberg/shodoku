import { parse, stringify } from "devalue";
import { StoreNames, unwrap } from "idb";
import { pipe } from "yta";
import { groupBy, map } from "yta/async";
import { dropWhile } from "yta/sync";

import { liveQueryBroadcaster } from "../helpers/channels.ts";
import {
  fetchSyncPatches,
  postSyncPatches as pushSyncPatches,
  STORE_NAMES,
} from "../helpers/sync.ts";
import { BookmarkedWord, CardProgress, CardReview, Deck, SyncPatch, SyncPatchStore, SyncStagingStore } from "../types.ts";

import { db as openingDb } from "./index.ts";
import { DB } from "./schema.ts";

const SYNC_LATEST_HASH_KEY = "shodoku.app.sync.latest";
const SYNC_PATCH_VERSION = 1;

async function createHash(
  syncRecordPartial: Omit<SyncPatch, "hash">
): Promise<string> {
  const message = JSON.stringify(syncRecordPartial);
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

type PartialSyncPatch = Omit<SyncPatch, "hash" | "parent">;

async function signPatch(partial: PartialSyncPatch): Promise<SyncPatch> {
  const unsigned = {
    ...partial,
    parent: localStorage.getItem(SYNC_LATEST_HASH_KEY),
  };

  return {
    ...unsigned,
    hash: await createHash(unsigned),
  };
}

async function createFirstSyncPatch(): Promise<PartialSyncPatch | null> {
  const db = await openingDb;
  const tx = db.transaction(STORE_NAMES);

  const stores: SyncPatchStore[] = [];
  for (const name of STORE_NAMES) {
    const store = tx.objectStore(name);
    const records = await store.getAll();

    if (records.length === 0) {
      continue;
    }

    const addValues = records.map((record) => {
      if (store.autoIncrement && typeof store.keyPath === "string") {
        const key = store.keyPath as keyof typeof record;
        delete record[key];
      }

      return stringify(record);
    });

    stores.push({
      name,
      add: addValues,
    });
  }

  if (stores.length === 0) {
    // TODO: Also check preferences.
    return null;
  }

  return {
    syncedAt: new Date(),
    dbVersion: db.version,
    patchVersion: SYNC_PATCH_VERSION,
    stores,
    preferences: [], // TODO,
  };
}

async function createSyncPatch(): Promise<PartialSyncPatch | null> {
  const db = await openingDb;

  if (await db.count("syncs") === 0 && localStorage.getItem(SYNC_LATEST_HASH_KEY)) {
    // This hash key is old and is preventing any future syncing.
    localStorage.removeItem(SYNC_LATEST_HASH_KEY);
  }

  if (!localStorage.getItem(SYNC_LATEST_HASH_KEY)) {
    return createFirstSyncPatch();
  }

  const tx = db.transaction(db.objectStoreNames);

  const stagedStores = await pipe(
    tx.objectStore("sync.staging.stores").iterate(),
    map((cursor) => cursor.value),
    groupBy((item) => item.store)
  );

  if (stagedStores.size === 0) {
    // TODO: Also check preferences
    return null;
  }

  const stores: SyncPatchStore[] = [];
  for (const [name, items] of stagedStores) {
    const adding = [];
    const putting = [];
    const deleting = [];

    for (const item of items) {
      if (item.op === "add") {
        const store = tx.objectStore(name);
        const record = await store.get(item.key);
        if (!record) {
          continue;
        }

        if (store.autoIncrement && typeof store.keyPath === "string") {
          const key = store.keyPath as keyof typeof record;
          delete record[key];
        }

        adding.push(stringify(record));
      } else if (item.op === "put") {
        putting.push(stringify(await tx.objectStore(name).get(item.key)));
      } else {
        deleting.push(stringify(item.key));
      }
    }

    // TODO: prune unnecessary operations.

    const store: SyncPatchStore = { name };
    if (adding.length > 0) {
      store.add = adding;
    }
    if (putting.length > 0) {
      store.put = putting;
    }
    if (deleting.length > 0) {
      store.delete = deleting;
    }

    if (store.add || store.put || store.delete) {
      stores.push(store);
    }
  }

  return {
    syncedAt: new Date(),
    dbVersion: db.version,
    patchVersion: 1,
    stores,
    preferences: [], // TODO
  };
}

function getKey(keyPath: string | string[], record: any): any {
  if (Array.isArray(keyPath)) {
    return keyPath.map((path) => getKey(path, record));
  }

  let obj = record;
  for (const seg of keyPath.split(".")) {
    obj = obj[seg];
  }

  return obj;
}

function shouldKeepMineDecks(mine: Deck, other: Deck): boolean {
  if (!mine.updatedAt) {
    if (!other.updatedAt) {
      return mine.createdAt > other.createdAt;
    }

    return false;
  }

  if (!other.updatedAt) {
    return true;
  }

  return mine.updatedAt > other.updatedAt;
}

function shouldKeepMineProgress(mine: CardProgress, other: CardProgress): boolean {
      if (!mine.fsrs.last_review) {
      return false;
    }

    if (!other.fsrs.last_review) {
      return true;
    }

    return mine.fsrs.last_review > other.fsrs.last_review;
}

function shouldKeepMineReviews(mine: CardReview, other: CardReview): boolean {
  return mine.log.review > other.log.review;
}

function shouldKeepMineBookmarkedWords(mine: BookmarkedWord, other: BookmarkedWord): boolean {
  return mine.bookmarkedAt > other.bookmarkedAt;
}

function shouldKeepMine<
  StoreName extends StoreNames<DB>,
  T extends DB[StoreName]["value"]
>(storeName: StoreName, mine: T, other: T): boolean {
  if (storeName === "decks") {
    return shouldKeepMineDecks(mine as Deck, other as Deck);
  }

  if (storeName === "progress") {
    return shouldKeepMineProgress(mine as CardProgress, other as CardProgress);
  }

  if (storeName === "reviews") {
    return shouldKeepMineReviews(mine as CardReview, other as CardReview);
  }

  if (storeName === "bookmarked-words") {
    return shouldKeepMineBookmarkedWords(mine as BookmarkedWord, other as BookmarkedWord);
  }

  return true;
}

function stagedRemoveRecord(
  storeName: StoreNames<DB>,
  record: string,
  staged?: PartialSyncPatch | null
) {
  if (!staged) {
    return;
  }

  const store = staged.stores.find(({ name }) => name === storeName);
  if (!store?.add) {
    return;
  }

  const index = store.add.indexOf(record);
  if (index !== -1) {
    store.add.splice(index, 1);
  }
}

function stagedPutRecord(
  storeName: StoreNames<DB>,
  record: string,
  staged?: PartialSyncPatch | null
) {
  if (!staged) {
    return;
  }

  const store = staged.stores.find(({ name }) => name === storeName);
  if (!store) {
    return;
  }

  let put = store.put;
  if (!put) {
    put = [];
    store.put = put;
  }

  put.push(record);
}

function isConstraintError(error: unknown) {
  return error instanceof DOMException && error.name === "ConstraintError";
}

async function applySyncPatches(
  patches: SyncPatch[],
  staged?: PartialSyncPatch | null
) {
  const db = await openingDb;
  const tx = db.transaction(db.objectStoreNames, "readwrite");

  const latest = localStorage.getItem(SYNC_LATEST_HASH_KEY) ?? null;
  let last: string | undefined;

  for (const patch of pipe(
    patches,
    dropWhile(({ parent }) => parent !== latest)
  )) {
    for (const patchStore of patch.stores) {
      const store = tx.objectStore(patchStore.name);

      for (const recordStr of patchStore.add ?? []) {
        const record = parse(recordStr);
        const adding = store.add(record);

        // Make sure a constraint error does’t abort the whole transaction.
        const request = unwrap(adding);
        request.addEventListener("error", (event) => {
          if (isConstraintError(request.error)) {
            event.preventDefault();
            event.stopPropagation();
          }
        });

        try {
          await adding;
        } catch (error) {
          if (isConstraintError(error)) {
            // Collision. Determine whether to keep mine or other.
            const mine = await store.get(getKey(store.keyPath, record));

            if (mine) {
              const mineStr = stringify(mine);
              stagedRemoveRecord(patchStore.name, mineStr, staged);

              if (shouldKeepMine(patchStore.name, mine, record)) {
                stagedPutRecord(patchStore.name, mineStr, staged);
              } else {
                store.put(record);
              }
            }
          } else {
            throw error;
          }
        }
      }

      for (const recordStr of patchStore.put ?? []) {
        const record = parse(recordStr);
        const cursor = await store.openCursor(getKey(store.keyPath, record));
        if (cursor) {
          cursor.update(record);
        } else {
          // CONSIDER: ensure staged has this deleted.
        }
      }

      for (const keyStr of patchStore.delete ?? []) {
        const key = parse(keyStr);
        console.log(key);
        store.delete(key);
      }
    }

    tx.objectStore("syncs").add(patch);
    last = patch.hash;
  }

  await tx.done;

  if (last) {
    localStorage.setItem(SYNC_LATEST_HASH_KEY, last);
  }
}

export async function syncRemote() {
  const patches = await fetchSyncPatches();
  const staged = await createSyncPatch();

  await applySyncPatches(patches, staged);

  if (!staged) {
    return;
  }

  const patch = await signPatch(staged);

  const db = await openingDb;
  const tx = db.transaction(
    ["sync.staging.preferences", "sync.staging.stores", "syncs"],
    "readwrite"
  );

  tx.objectStore("sync.staging.stores").clear();
  tx.objectStore("sync.staging.preferences").clear();
  tx.objectStore("syncs").add(patch);

  await tx.done;

  localStorage.setItem(SYNC_LATEST_HASH_KEY, patch.hash);
  liveQueryBroadcaster.postMessage("sync-enabled");

  await pushSyncPatches([...patches, patch]);
}

function isSyncEnabled() {
  return localStorage.getItem(SYNC_LATEST_HASH_KEY) != null;
}

export async function disableSync() {
  const db = await openingDb;
  const tx = db.transaction(
    ["sync.staging.preferences", "sync.staging.stores", "syncs"],
    "readwrite"
  );

  tx.objectStore("sync.staging.stores").clear();
  tx.objectStore("sync.staging.preferences").clear();
  tx.objectStore("syncs").clear();

  await tx.done;
  localStorage.removeItem(SYNC_LATEST_HASH_KEY);
  liveQueryBroadcaster.postMessage("sync-disabled");
}

export async function addToSyncStaging(instructions: SyncStagingStore[]) {
  if (!isSyncEnabled()) {
    return;
  }

  const db = await openingDb;
  const tx = db.transaction("sync.staging.stores", "readwrite");

  for (const instr of instructions) {
    tx.store.add(instr);
  }

  await tx.done;
}
