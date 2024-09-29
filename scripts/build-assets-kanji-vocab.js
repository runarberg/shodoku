import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

import sql from "sql-template-strings";
import { open as opendb } from "sqlite";
import sqlite3 from "sqlite3";

await fs.mkdir(new URL("../public/data/kanji-vocab-v1", import.meta.url), {
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
    (
      SELECT
        json_group_array(
          json_object(
            'word', word_writings.word,
            'sentences', json(s.sentences)
          )
          ORDER BY
            word_priority.freq ASC NULLS LAST,
            min(word_priority.ichi, word_priority.news, word_priority.spec) ASC NULLS LAST
        )
      FROM
        word_writings
      INNER JOIN word_priority
        ON word_priority.word = word_writings.word
        AND word_priority.writing = word_writings.text
      LEFT OUTER JOIN
        (
          SELECT
            writing,
            json_group_array(sentence) as sentences
          FROM sentence_words
          WHERE
            good_example = 1
            AND (sentence_words.text ISNULL OR instr(sentence_words.text, literal))
          GROUP BY writing
        ) as s
        ON s.writing = word_writings.text
      WHERE
        instr(word_writings.text, kanji.literal)
        AND word_writings.ateji ISNULL
        AND word_writings.irregular ISNULL
        AND word_writings.rare ISNULL
        AND word_writings.outdated ISNULL
        AND word_writings.search_only ISNULL
        AND (
          SELECT min(coalesce(kana_preferred, 0))
          FROM word_meanings
          WHERE word_meanings.word = word_writings.word
        ) = 0
    ) as words
  FROM kanji
`,
  (error, row) => {
    if (error) {
      console.error(error);
      return;
    }

    const hex = row.codepoint.toString(16).padStart(5, "0");
    const path = new URL(
      `../public/data/kanji-vocab-v1/${hex}.json`,
      import.meta.url
    );

    const words = JSON.parse(row.words).map((word) => JSON.parse(word));
    for (const word of words) {
      if (!word.sentences) {
        delete word.sentences;
      }
    }

    fs.writeFile(
      path,
      JSON.stringify({
        codepoint: row.codepoint,
        literal: row.literal,
        words,
      })
    );
  }
);
