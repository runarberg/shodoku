import { useLocalStorage } from "@vueuse/core";

import { db } from "../db/index.ts";
import { liveQueryBroadcaster } from "../helpers/channels.ts";

export const dueLimit = useLocalStorage(
  "shodoku.app.preferences.limit.due",
  50
);

export const newLimit = useLocalStorage(
  "shodoku.app.preferences.limit.new",
  10
);

export const fsrsFuzzEnabled = useLocalStorage(
  "shodoku.app.preferences.fsrs.fuzz-enabled",
  true
);

export async function increaseReviewLimit(
  count = { new: newLimit.value, due: dueLimit.value }
) {
  await (
    await db
  ).add("review-limits", {
    time: new Date(),
    count,
  });

  return liveQueryBroadcaster.postMessage("review-limit-increased");
}
