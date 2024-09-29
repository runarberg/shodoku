import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

import sql from "sql-template-strings";
import { open as opendb } from "sqlite";
import sqlite3 from "sqlite3";

await fs.mkdir(new URL("../public/data/kanji-v1", import.meta.url), {
  recursive: true,
});

const db = await opendb({
  filename: fileURLToPath(import.meta.resolve("../assets.db")),
  driver: sqlite3.Database,
});

db.each(
  sql`
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
`,
  (error, row) => {
    if (error) {
      console.error(error);
      return;
    }

    const hex = row.codepoint.toString(16).padStart(5, "0");
    const path = new URL(
      `../public/data/kanji-v1/${hex}.json`,
      import.meta.url
    );

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
      })
    );
  }
);
