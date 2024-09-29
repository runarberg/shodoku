import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

import sql from "sql-template-strings";
import { open as opendb } from "sqlite";
import sqlite3 from "sqlite3";
import { text } from "stream/consumers";

await fs.mkdir(new URL("../public/data/sentences-v1", import.meta.url), {
  recursive: true,
});

const db = await opendb({
  filename: fileURLToPath(import.meta.resolve("../assets.db")),
  driver: sqlite3.Database,
});

db.each(
  sql`
  SELECT
    sentence_meanings.sentence AS id,
    sentences.text AS sentence,
    meanings.text AS meaning,
    (
      SELECT
        json_group_array(
          json_object(
            'text', coalesce(sentence_words.text, sentence_words.writing),
            'word', coalesce(
              sentence_words.word_id,
              CASE
                WHEN sentence_words.reading ISNULL THEN
                  coalesce(
                    (
                      SELECT word_writings.word
                      FROM word_writings
                      WHERE word_writings.text = sentence_words.writing
                      LIMIT 1
                    ),
                    (
                      SELECT word_readings.word
                      FROM word_readings
                      WHERE
                        word_readings.text = sentence_words.writing
                        AND (
                          SELECT count(*)
                          FROM word_writings
                          WHERE word_writings.word = word_readings.word
                          LIMIT 1
                        ) = 0
                      LIMIT 1
                    )
                  )
                ELSE
                  (
                    SELECT word_readings.word
                    FROM word_writings
                    INNER JOIN word_readings ON word_readings.word = word_writings.word
                    WHERE
                      word_writings.text = sentence_words.writing
                      AND word_readings.text = sentence_words.reading
                    LIMIT 1
                  )
              END
            ),
            'furigana', CASE
              WHEN NOT sentence_words.word_id ISNULL THEN
                (
                  SELECT furigana
                  FROM word_furigana
                  WHERE
                    word_furigana.writing = sentence_words.writing
                    AND word_furigana.reading = (
                      SELECT text
                      FROM word_readings
                      WHERE word_readings.word = sentence_words.word_id
                    )
                )
              WHEN sentence_words.reading ISNULL THEN
                (
                  SELECT furigana
                  FROM word_furigana
                  WHERE word_furigana.writing = sentence_words.writing
                )
              ELSE
                (
                  SELECT furigana
                  FROM word_furigana
                  WHERE
                    word_furigana.writing = sentence_words.writing
                    AND word_furigana.reading = sentence_words.reading
                )
            END
          )
          ORDER BY sentence_words.seq
        )
      FROM sentence_words
      WHERE sentence_words.sentence = sentence_meanings.sentence
    ) AS words
  FROM sentence_meanings
  INNER JOIN sentences
    ON sentences.id = sentence_meanings.sentence
  INNER JOIN sentences
    AS meanings
    ON meanings.id = sentence_meanings.meaning
`,
  (error, row) => {
    if (error) {
      console.error(error);
      return;
    }

    const path = new URL(
      `../public/data/sentences-v1/${row.id}.json`,
      import.meta.url
    );

    const words = JSON.parse(row.words).map((word) => JSON.parse(word));
    for (const word of words) {
      if (typeof word.furigana === "string") {
        word.furigana = JSON.parse(word.furigana);
      }
    }

    fs.writeFile(
      path,
      JSON.stringify({
        id: row.id,
        sentence: row.sentence,
        meaning: row.meaning,
        words,
      })
    );
  }
);
