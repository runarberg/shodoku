import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

import Database from "better-sqlite3";

await fs.mkdir(new URL("../public/data/kanji-vocab-v1", import.meta.url), {
  recursive: true,
});

const db = new Database(fileURLToPath(import.meta.resolve("../assets.db")));
db.pragma("journal_mode = WAL");

const selectKanji = db.prepare(`
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
        )
      FROM
        word_writings
      INNER JOIN word_priority
        ON word_priority.word = word_writings.word
        AND word_priority.writing = word_writings.text
      LEFT OUTER JOIN
        (
          SELECT
            word,
            text,
            writing,
            json_group_array(sentence) as sentences
          FROM sentence_words
          WHERE good_example = 1
          GROUP BY word
        ) as s
        ON
          s.word = word_writings.word
          AND instr(coalesce(s.text, s.writing), literal)
      WHERE
        instr(word_writings.text, kanji.literal)
        AND word_writings.ateji = 0
        AND word_writings.irregular = 0
        AND word_writings.rare = 0
        AND word_writings.outdated = 0
        AND word_writings.search_only = 0
        AND (
          SELECT min(coalesce(kana_preferred, 0))
          FROM word_meanings
          WHERE word_meanings.word = word_writings.word
        ) = 0
    ) as words
  FROM kanji
`);

let i = 0;
for (const row of selectKanji.iterate()) {
  const hex = row.codepoint.toString(16).padStart(5, "0");
  const fileURL = new URL(
    `../public/data/kanji-vocab-v1/${hex}.json`,
    import.meta.url
  );

  const words = JSON.parse(row.words);
  for (const word of words) {
    if (!word.sentences) {
      delete word.sentences;
    }
  }

  fs.writeFile(
    fileURL,
    JSON.stringify({
      codepoint: row.codepoint,
      literal: row.literal,
      words,
    })
  );

  i += 1;

  if (i % 100 === 0) {
    console.log(i, fileURL.pathname);
  }
}
