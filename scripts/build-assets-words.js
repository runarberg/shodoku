import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

import sql from "sql-template-strings";
import { open as opendb } from "sqlite";
import sqlite3 from "sqlite3";

await fs.mkdir(new URL("../public/data/words-v1", import.meta.url), {
  recursive: true,
});

const db = await opendb({
  filename: fileURLToPath(import.meta.resolve("../assets.db")),
  driver: sqlite3.Database,
});

function stripNull(obj) {
  if (typeof obj !== "object") {
    return obj;
  }

  return Object.fromEntries(
    Object.entries(obj)
      .map(([key, child]) => {
        if (Array.isArray(child)) {
          return [key, child.map(stripNull)];
        }

        if (child && typeof child === "object") {
          return [key, stripNull(child)];
        }

        return [key, child];
      })
      .filter(
        ([_, value]) =>
          value !== null &&
          value !== false &&
          value !== "" &&
          !(Array.isArray(value) && value.length === 0)
      )
  );
}

db.each(
  sql`
    SELECT
      id,
      (
        SELECT json_group_array(
          json_object(
            'text', text,
            'ateji', CASE WHEN ateji = 1 THEN json('true') ELSE json('false') END,
            'irregular', CASE WHEN irregular = 1 THEN json('true') ELSE json('false') END,
            'rare', CASE WHEN rare = 1 THEN json('true') ELSE json('false') END,
            'outdated', CASE WHEN outdated = 1 THEN json('true') ELSE json('false') END,
            'searchOnly', CASE WHEN search_only = 1 THEN json('true') ELSE json('false') END,
            'priority', CASE WHEN
              freq ISNULL AND ichi ISNULL AND news ISNULL AND spec ISNULL
            THEN
              json('null')
            ELSE
              json_object(
                'freq', freq,
                'ichi', ichi,
                'news', news,
                'spec', spec
              )
            END
          )
          -- comment out when using sqlite 3.44
          -- ORDER BY
          --   word_priority.freq ASC NULLS LAST,
          --   min(word_priority.ichi, word_priority.news, word_priority.spec) ASC NULLS LAST
        )
        FROM word_writings
        OUTER LEFT JOIN word_priority
          ON word_priority.word = id
          AND word_priority.writing = text
        WHERE word_writings.word = id
      ) AS writings,
      (
        SELECT json_group_array(
          json_object(
            'text', text,
            'noKanji', CASE WHEN word_readings.no_kanji = 1 THEN json('true') ELSE json('false') END,
            'gikun', CASE WHEN word_readings.gikun = 1 THEN json('true') ELSE json('false') END,
            'irregular', CASE WHEN word_readings.irregular = 1 THEN json('true') ELSE json('false') END,
            'rare', CASE WHEN word_readings.rare = 1 THEN json('true') ELSE json('false') END,
            'outdated', CASE WHEN word_readings.outdated = 1 THEN json('true') ELSE json('false') END,
            'searchOnly', CASE WHEN word_readings.search_only = 1 THEN json('true') ELSE json('false') END,
            'useWith', json(use_with.writings),
            'priority', CASE WHEN
              freq ISNULL AND ichi ISNULL AND news ISNULL AND spec ISNULL
            THEN
              json('null')
            ELSE
              json_object(
                'freq', freq,
                'ichi', ichi,
                'news', news,
                'spec', spec
              )
            END
          )
        )
        FROM
          word_readings
        OUTER LEFT JOIN word_priority
          ON word_priority.word = id
          AND word_priority.reading = text
        OUTER LEFT JOIN
          (
            SELECT word, reading, json_group_array(writing) as writings
            FROM word_reading_writing_pairs
            WHERE word = id
            GROUP BY reading
          ) as use_with
          ON use_with.reading = text
        WHERE word_readings.word = words.id
      ) AS readings,
      (
        SELECT json_group_array(json_object(
          'writing', writing,
          'reading', reading,
          'furigana', json(furigana)
        ))
        FROM word_furigana
        WHERE
          word_furigana.writing IN (SELECT text FROM word_writings WHERE word_writings.word = id)
          AND word_furigana.reading IN (SELECT text FROM word_readings WHERE word_readings.word = id)
      ) as furigana,
      (
        SELECT json_group_array(
          json_object(
            'info', info,
            'pos', json(pos),
            'misc', json(misc),
            'kanaPreferred', CASE WHEN kana_preferred = 1 THEN json('true') ELSE json('false') END,
            'useWithWriting', json(use_with_writing),
            'useWithReading', json(use_with_reading),
            'glossary', json(glossary)
          )
        )
        FROM (
          SELECT 
            id,
            info,
            pos,
            misc,
            kana_preferred,
            json_group_array(word_meaning_glossary.text) as glossary,
            use_with_writing.writings as use_with_writing,
            use_with_reading.readings as use_with_reading
          FROM word_meanings
          INNER JOIN word_meaning_glossary
            ON word_meaning_glossary.word_meaning = word_meanings.id
            AND word_meaning_glossary.word = word_meanings.word
          OUTER LEFT JOIN
            (
              SELECT word, word_meanings as meaning, json_group_array(writing) as writings
              FROM word_meaning_writing_pairs
              WHERE word = id
              GROUP BY meaning
            ) as use_with_writing
            ON use_with_writing.meaning = word_meanings.id
          OUTER LEFT JOIN
            (
              SELECT word, word_meanings as meaning, json_group_array(reading) as readings
              FROM word_meaning_reading_pairs
              WHERE word = id
              GROUP BY meaning
            ) as use_with_reading
            ON use_with_reading.meaning = word_meanings.id
          WHERE word_meanings.word = words.id
          GROUP BY word_meanings.id
          ORDER BY word_meanings.id, word_meaning_glossary.seq
        )
      ) as meanings
    FROM words
  `,
  (error, row) => {
    if (error) {
      console.error(error);
      return;
    }

    const path = new URL(
      `../public/data/words-v1/${row.id}.json`,
      import.meta.url
    );
    fs.writeFile(
      path,
      JSON.stringify({
        id: row.id,
        writings: JSON.parse(row.writings).map(stripNull),
        readings: JSON.parse(row.readings).map(stripNull),
        furigana: JSON.parse(row.furigana),
        meanings: JSON.parse(row.meanings).map(stripNull),
      })
    );
  }
);
