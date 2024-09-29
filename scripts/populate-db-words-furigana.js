import { createReadStream } from "node:fs";
import { fileURLToPath } from "node:url";

import sql from "sql-template-strings";
import { open as opendb } from "sqlite";
import sqlite3 from "sqlite3";
import { chain } from "stream-chain";
import StreamJSON from "stream-json";
import StreamArray from "stream-json/streamers/StreamArray.js";

const db = await opendb({
  filename: fileURLToPath(import.meta.resolve("../assets.db")),
  driver: sqlite3.Database,
});

await db.exec(sql`DROP TABLE IF EXISTS word_furigana`);
await db.exec(sql`
  CREATE TABLE word_furigana (
    writing TEXT NOT NULL,
    reading TEXT NOT NULL,
    furigana BLOB
  )
`);
await db.exec(sql`DROP INDEX IF EXISTS word_furigana_index`);
await db.exec(sql`CREATE INDEX word_furigana_index ON word_furigana (writing)`);

db.exec("BEGIN");
const pipeline = chain([
  createReadStream(new URL("../assets/JmdictFurigana.json", import.meta.url), {
    encoding: "utf8",
  }),
  StreamJSON.parser(),
  StreamArray.streamArray(),
]);

pipeline.on("data", ({ value }) => {
  db.run(sql`
    INSERT INTO word_furigana (writing, reading, furigana)
    VALUES (${value.text}, ${value.reading}, ${JSON.stringify(value.furigana)})
  `);
});

pipeline.on("end", () => {
  db.exec("COMMIT");
});
