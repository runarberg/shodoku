import { openDB } from "idb";

import { DB } from "./schema.ts";
import upgrade from "./upgrade.ts";

export const db = openDB<DB>("shodoku", 7, {
  upgrade,
});
