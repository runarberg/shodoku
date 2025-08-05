import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

import Database from "better-sqlite3";

await fs.mkdir(new URL("../public/data/index", import.meta.url), {
  recursive: true,
});

const db = new Database(fileURLToPath(import.meta.resolve("../assets.db")));
db.pragma("journal_mode = WAL");

const selectKanji = db.prepare(`
  SELECT
    literal,
    json_group_array(DISTINCT kanji_readings.text ORDER BY kanji_readings.seq)
      FILTER (WHERE kanji_readings.type = 'kun' AND NOT kanji_readings.text ISNULL)
      AS kun_yomi,
    json_group_array(DISTINCT kanji_readings.text ORDER BY kanji_readings.seq)
      FILTER (WHERE kanji_readings.type = 'on' AND NOT kanji_readings.text ISNULL)
      AS on_yomi,
    json_group_array(DISTINCT kanji_meanings.text ORDER BY kanji_meanings.seq)
      FILTER (WHERE NOT kanji_meanings.text ISNULL)
      AS meanings
  FROM kanji
  OUTER LEFT JOIN kanji_readings ON kanji.codepoint = kanji_readings.kanji
  OUTER LEFT JOIN kanji_meanings ON kanji.codepoint = kanji_meanings.kanji
  GROUP BY kanji.codepoint
  ORDER BY
    kanji.grade ASC NULLS LAST,
    kanji.freq ASC NULLS LAST
`);

const fileURL = new URL(`../public/data/index/kanji-v1.usv`, import.meta.url);
const file = await fs.open(fileURL, "w");
const fileStream = file.createWriteStream();

const UNIT_SEP = "\u{241f}";
const RECORD_SEP = "\u{241e}";
const GROUP_SEP = "\u{241d}";

for (const row of selectKanji.iterate()) {
  const { literal } = row;
  const kunYomi = JSON.parse(row.kun_yomi).join(UNIT_SEP);
  const onYomi = JSON.parse(row.on_yomi).join(UNIT_SEP);
  const meanings = JSON.parse(row.meanings).join(UNIT_SEP);

  const line = [literal, kunYomi, onYomi, meanings].join(
    `${UNIT_SEP}${RECORD_SEP}`,
  );

  fileStream.write(`${line}${UNIT_SEP}${RECORD_SEP}${GROUP_SEP}\n`);
}
