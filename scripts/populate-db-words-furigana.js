import { createReadStream } from "node:fs";
import { fileURLToPath } from "node:url";

import Database from "better-sqlite3";
import { chain } from "stream-chain";
import StreamJSON from "stream-json";
import StreamArray from "stream-json/streamers/StreamArray.js";

const db = new Database(fileURLToPath(import.meta.resolve("../assets.db")));
db.pragma("journal_mode = WAL");

db.exec(`DROP TABLE IF EXISTS word_furigana`);
db.exec(`
  CREATE TABLE word_furigana (
    writing TEXT NOT NULL,
    reading TEXT NOT NULL,
    furigana BLOB,
    PRIMARY KEY (writing ASC, reading)
  )
`);

const insertWordFurigana = db.prepare(`
  INSERT INTO word_furigana (writing, reading, furigana)
  VALUES (?, ?, ?)
`);

db.exec("BEGIN");
const pipeline = chain([
  createReadStream(new URL("../assets/JmdictFurigana.json", import.meta.url), {
    encoding: "utf8",
  }),
  StreamJSON.parser(),
  StreamArray.streamArray(),
]);

pipeline.on("data", ({ value }) => {
  insertWordFurigana.run(
    value.text,
    value.reading,
    JSON.stringify(value.furigana),
  );
});

pipeline.on("end", () => {
  db.exec("COMMIT");
});
