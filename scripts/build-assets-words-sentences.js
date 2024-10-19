import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

import Database from "better-sqlite3";

await fs.mkdir(new URL("../public/data/words-sentences-v1", import.meta.url), {
  recursive: true,
});

const db = new Database(fileURLToPath(import.meta.resolve("../assets.db")));
db.pragma("journal_mode = WAL");

const selectWords = db.prepare(`
  SELECT
    words.id as id,
    json_group_array(sentence_words.sentence) as sentences
  FROM words
  LEFT OUTER JOIN sentence_words ON sentence_words.word = words.id
  WHERE sentence_words.good_example = 1
  GROUP BY words.id
`);

for (const row of selectWords.iterate()) {
  const fileURL = new URL(
    `../public/data/words-sentences-v1/${row.id}.json`,
    import.meta.url
  );

  fs.writeFile(fileURL, row.sentences);
}
