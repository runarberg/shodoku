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
          DISTINCT word_writings.word
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
    import.meta.url,
  );

  const data = {
    codepoint: row.codepoint,
    literal: row.literal,
    words: JSON.parse(row.words),
  };

  fs.writeFile(fileURL, JSON.stringify(data));

  i += 1;
  if (i % 100 === 0) {
    // eslint-disable-next-line no-console
    console.log(i, fileURL.pathname);
  }
}
