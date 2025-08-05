import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

import Database from "better-sqlite3";

await fs.mkdir(new URL("../public/data/kanji-v1", import.meta.url), {
  recursive: true,
});

const db = new Database(fileURLToPath(import.meta.resolve("../assets.db")));

const selectKanji = db.prepare(`
  SELECT
    codepoint,
    literal,
    radical,
    freq,
    grade,
    stroke_count,
    (
      SELECT json_group_array(kanji_meanings.text)
      FROM kanji_meanings
      WHERE kanji_meanings.kanji = kanji.codepoint
      ORDER BY seq
    ) as meanings,
    (
      SELECT json_group_array(kanji_readings.text)
      FROM kanji_readings
      WHERE
        kanji_readings.kanji = kanji.codepoint
        AND kanji_readings.type = 'on'
      ORDER BY seq
    ) as on_yomi,
    (
      SELECT json_group_array(kanji_readings.text)
      FROM kanji_readings
      WHERE
        kanji_readings.kanji = kanji.codepoint
        AND kanji_readings.type = 'kun'
      ORDER BY seq
    ) as kun_yomi
  FROM kanji
`);

for (const row of selectKanji.iterate()) {
  const hex = row.codepoint.toString(16).padStart(5, "0");
  const path = new URL(`../public/data/kanji-v1/${hex}.json`, import.meta.url);

  fs.writeFile(
    path,
    JSON.stringify({
      codepoint: row.codepoint,
      literal: row.literal,
      radical: row.radical,
      meanings: JSON.parse(row.meanings),
      onYomi: JSON.parse(row.on_yomi),
      kunYomi: JSON.parse(row.kun_yomi),
      strokeCount: row.stroke_count ?? undefined,
      freq: row.freq ?? undefined,
      grade: row.grade ?? undefined,
    }),
  );
}
