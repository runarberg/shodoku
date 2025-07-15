import {
  remoteSyncFetchHeaders,
  remoteSyncFetchMethod,
  remoteSyncFetchURL,
  remoteSyncPushBody,
  remoteSyncPushHeaders,
  remoteSyncPushMethod,
  remoteSyncPushURL,
} from "../store/sync.ts";
import { SyncPatch, SyncPatchStore } from "../types.ts";

import {
  AssertionError,
  assertIsArray,
  assertIsObject,
  assertIsString,
  assertKeyIsArray,
  assertKeyIsNumber,
  assertKeyIsString,
  assertKeyIsStringArray,
} from "./assert.ts";
import { fromBase64, toBase64 } from "./text.ts";

export const STORE_NAMES = [
  "bookmarked-words",
  "cards",
  "decks",
  "progress",
  "reviews",
] as const;

export const PLACEHOLDER = "${PLACEHOLDER}";

function assertIsStoreName(
  str: string
): asserts str is typeof STORE_NAMES[number] {
  if (!(STORE_NAMES as readonly string[]).includes(str)) {
    throw new AssertionError({
      actual: str,
      message: `Expected "${str}" to be a store name`,
    });
  }
}

function assertKeyIsSyncPatchStoreArray<
  T extends object,
  Key extends PropertyKey
>(key: Key, thing: T): asserts thing is T & { [P in Key]: SyncPatchStore[] } {
  assertKeyIsArray(key, thing);

  for (const item of thing[key]) {
    assertIsObject(item);
    assertKeyIsString("name", item);
    assertIsStoreName(item.name);
    assertKeyIsStringArray("add", item, { optional: true });
    assertKeyIsArray("set", item, { optional: true });

    for (const pair of item.set ?? []) {
      assertIsArray(pair);

      if (pair.length !== 2) {
        throw new AssertionError({
          actual: pair,
          message: `Excpected a 2-tuple. Got ${pair.length}-tuple`,
        });
      }

      assertIsString(pair[0]); // key;
      assertIsArray(pair[1]); // operations;

      for (const op of pair[1]) {
        assertIsArray(op);

        if (op.length !== 3) {
          throw new AssertionError({
            actual: pair,
            message: `Excpected a 3-tuple. Got ${op.length}-tuple`,
          });
        }

        assertKeyIsString(0, op); // operation
        assertKeyIsStringArray(1, op); // path
        assertKeyIsString(2, op); // value
      }
    }

    assertKeyIsStringArray("delete", item, { optional: true });
  }
}

function assertKeyIsSyncPatchPreferencesArray<
  T extends object,
  Key extends PropertyKey
>(
  key: Key,
  thing: T
): asserts thing is T & { [P in Key]: Array<[string, string | null]> } {
  assertKeyIsArray(key, thing);

  for (const item of thing[key]) {
    assertIsArray(item);
    assertKeyIsString(0, item);
    assertKeyIsString(1, item, { nullable: true });
  }
}

export async function fetchSyncPatches(): Promise<SyncPatch[]> {
  const method = remoteSyncFetchMethod.value;
  const url = URL.parse(remoteSyncFetchURL.value);
  const headers = new Headers(remoteSyncFetchHeaders.value);

  if (!url) {
    throw new Error("Remote sync not set up");
  }

  const shouldAddCachebuster = url.host === "gist.githubusercontent.com";
  if (shouldAddCachebuster) {
    url.searchParams.set("cachebuster", new Date().toISOString());
  }

  const response = await fetch(url, { method, headers, mode: "cors" });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Error ${response.status} fetching sync: ${text}`);
  }

  if (!text.trim()) {
    return [];
  }

  const useBase64 = remoteSyncPushBody.value;
  const data: unknown = JSON.parse(useBase64 ? fromBase64(text) : text);

  assertIsArray(data);

  return data.map((item: unknown) => {
    assertIsObject(item);
    assertKeyIsString("hash", item);
    assertKeyIsString("parent", item, { nullable: true });
    assertKeyIsString("syncedAt", item);
    assertKeyIsNumber("dbVersion", item);
    assertKeyIsNumber("patchVersion", item);
    assertKeyIsSyncPatchStoreArray("stores", item);
    assertKeyIsSyncPatchPreferencesArray("preferences", item);

    return {
      ...item,
      syncedAt: new Date(item.syncedAt),
    };
  });
}

export async function postSyncPatches(patches: SyncPatch[]) {
  const method = remoteSyncPushMethod.value;
  const url = URL.parse(remoteSyncPushURL.value);
  const headers = new Headers(remoteSyncPushHeaders.value);
  const bodyTemplate = remoteSyncPushBody.value;

  if (!url) {
    throw new Error("Remote sync not set up");
  }

  let body = JSON.stringify(patches);
  if (bodyTemplate) {
    body = bodyTemplate.replace(PLACEHOLDER, toBase64(body));
  }

  const response = await fetch(url, { method, headers, body, mode: "cors" });

  if (!response.ok) {
    throw new Error(
      `Error ${response.status} pushing sync: ${await response.text()}`
    );
  }
}
