import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

import Database from "better-sqlite3";

await fs.mkdir(new URL("../public/data/index", import.meta.url), {
  recursive: true,
});

const db = new Database(fileURLToPath(import.meta.resolve("../assets.db")));
db.pragma("journal_mode = WAL");

const selectWords = db.prepare(`
  SELECT
    id,
    json_group_array(DISTINCT word_readings.text)
      FILTER (WHERE NOT word_readings.text ISNULL)
      AS readings,
    json_group_array(DISTINCT word_writings.text)
      FILTER (WHERE NOT word_writings.text ISNULL)
      AS writings,
    json_group_array(DISTINCT word_meaning_glossary.text ORDER BY meaning, seq)
      FILTER (WHERE NOT word_meaning_glossary.text ISNULL)
      AS glossary
  FROM words
  OUTER LEFT JOIN word_readings ON words.id = word_readings.word
  OUTER LEFT JOIN word_writings ON words.id = word_writings.word
  OUTER LEFT JOIN word_meaning_glossary ON words.id = word_meaning_glossary.word
  OUTER LEFT JOIN word_priority
    ON words.id = word_priority.word
    AND word_priority.reading = word_readings.text
  GROUP BY words.id
  ORDER BY
    (
      SELECT min(priority)
      FROM word_lists
      WHERE
        word_lists.name in (
          SELECT list
          FROM word_list_words
          WHERE word_list_words.writing = word_writings.text
        )
    ) ASC NULLS LAST,
    word_priority.freq ASC NULLS LAST,
    min(word_priority.ichi, word_priority.news, word_priority.spec) ASC NULLS LAST,
    word_writings.text ASC
`);

const fileURL = new URL(`../public/data/index/words-v1.usv`, import.meta.url);
const file = await fs.open(fileURL, "w");
const fileStream = file.createWriteStream();

const UNIT_SEP = "\u{241f}";
const RECORD_SEP = "\u{241e}";
const GROUP_SEP = "\u{241d}";

for (const row of selectWords.iterate()) {
  const { id } = row;
  const readings = JSON.parse(row.readings).join(UNIT_SEP);
  const writings = JSON.parse(row.writings).join(UNIT_SEP);
  const glossary = JSON.parse(row.glossary).join(UNIT_SEP);

  const line = [id, readings, writings, glossary].join(
    `${UNIT_SEP}${RECORD_SEP}`,
  );

  fileStream.write(`${line}${UNIT_SEP}${RECORD_SEP}${GROUP_SEP}\n`);
}
