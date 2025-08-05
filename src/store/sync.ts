import { useLocalStorage } from "@vueuse/core";

import { db } from "../db/index.ts";
import { useLiveQuery } from "../helpers/db.ts";

const KEY_PREFIX = "shodoku.app.config.sync.remote";

export const remoteSyncFetchMethod = useLocalStorage(
  `${KEY_PREFIX}.fetch.method`,
  "GET",
);

export const remoteSyncFetchURL = useLocalStorage(
  `${KEY_PREFIX}.fetch.url`,
  "",
);

export const remoteSyncFetchHeaders = useLocalStorage<[string, string][]>(
  `${KEY_PREFIX}.fetch.headers`,
  [],
);

export const remoteSyncPushMethod = useLocalStorage(
  `${KEY_PREFIX}.push.method`,
  "PUT",
);

export const remoteSyncPushURL = useLocalStorage(`${KEY_PREFIX}.push.url`, "");

export const remoteSyncPushHeaders = useLocalStorage<[string, string][]>(
  `${KEY_PREFIX}.push.headers`,
  [],
);

export const remoteSyncPushBody = useLocalStorage<string | undefined>(
  `${KEY_PREFIX}.push.body`,
  undefined,
);

export function useRemoteSyncEnabled() {
  return useLiveQuery(async () => (await (await db).count("syncs")) > 0);
}

export function useHasUnsyncedStores() {
  return useLiveQuery(
    async () => (await (await db).count("sync.staging.stores")) > 0,
  );
}
