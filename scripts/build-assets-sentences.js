import fs from "node:fs";
import { fileURLToPath } from "node:url";

import Database from "better-sqlite3";

import { annotateSentenceFurigana } from "./annotators.js";

fs.mkdirSync(new URL("../public/data/sentences-v1", import.meta.url), {
  recursive: true,
});

const db = new Database(fileURLToPath(import.meta.resolve("../assets.db")));
db.pragma("journal_mode = WAL");

const selectSentences = db.prepare(`
  SELECT
    sentence_meanings.sentence AS id,
    sentences.text AS sentence,
    meanings.text AS meaning,
    (
      SELECT
        json_group_array(
          json_object(
            'text', coalesce(sentence_words.text, sentence_words.writing),
            'word', sentence_words.word,
            'furigana', (
               SELECT json(furigana)
               FROM word_furigana
               WHERE
                 word_furigana.writing = coalesce(
                   sentence_words.writing,
                   (SELECT text FROM word_writings WHERE word_writings.word = sentence_words.word)
                 )
                 AND word_furigana.reading = coalesce(
                   sentence_words.reading,
                   (SELECT text FROM word_readings WHERE word_readings.word = sentence_words.word)
             )
          )
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
`);

let i = 0;
for (const row of selectSentences.iterate()) {
  const fileURL = new URL(
    `../public/data/sentences-v1/${row.id}.json`,
    import.meta.url
  );

  const words = JSON.parse(row.words);

  fs.writeFileSync(
    fileURL,
    JSON.stringify({
      id: row.id,
      sentence: row.sentence,
      meaning: row.meaning,
      words: annotateSentenceFurigana(row.sentence, words),
    })
  );

  i += 1;
  if (i % 10000 === 0) {
    console.log(i, fileURL.pathname);
  }
}
