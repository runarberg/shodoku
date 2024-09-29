import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

import sql from "sql-template-strings";
import { open as opendb } from "sqlite";
import sqlite3 from "sqlite3";

import { parseSentenceIndexLine } from "./parsers.js";

const db = await opendb({
  filename: fileURLToPath(import.meta.resolve("../assets.db")),
  driver: sqlite3.Database,
});

await db.exec(sql`DROP TABLE IF EXISTS sentences`);
await db.exec(sql`
  CREATE TABLE sentences (
    id INTEGER PRIMARY KEY,
    lang TEXT NOT NULL,
    text TEXT
  )
`);

await db.exec(sql`DROP TABLE IF EXISTS sentence_words`);
await db.exec(sql`
  CREATE TABLE sentence_words (
    sentence INTEGER REFERENCES sentences (id),
    text TEXT,
    writing TEXT REFERENCES words_writings (text),
    word_id INTEGER REFERENCES words (id),
    reading TEXT,
    sense INTEGER,
    good_example INTEGER,
    seq INTEGER NOT NULL
  )
`);

await db.exec(sql`DROP INDEX IF EXISTS sentence_word_index`);
await db.exec(
  sql`CREATE INDEX sentence_word_index ON sentence_words (sentence, writing)`
);

await db.exec(sql`DROP TABLE IF EXISTS sentence_meanings`);
await db.exec(sql`
  CREATE TABLE sentence_meanings (
    sentence INTEGER REFERENCES sentences (id),
    meaning INTEGER REFERENCES sentences (id)
  )
`);

db.exec("BEGIN");
const sentencesJpnPath = new URL(
  "../assets/jpn_sentences.tsv",
  import.meta.url
);
for await (const line of (await fs.open(sentencesJpnPath)).readLines()) {
  const [id, lang, text] = line.split("\t");

  db.run(sql`
    INSERT INTO sentences (id, lang, text) VALUES
    (${Number.parseInt(id)}, ${lang}, ${text})
  `);
}
db.exec("COMMIT");

db.exec("BEGIN");
const sentencesEngPath = new URL(
  "../assets/eng_sentences.tsv",
  import.meta.url
);
for await (const line of (await fs.open(sentencesEngPath)).readLines()) {
  const [id, lang, text] = line.split("\t");

  db.run(sql`
    INSERT INTO sentences (id, lang, text) VALUES
    (${Number.parseInt(id)}, ${lang}, ${text})
  `);
}
db.exec("COMMIT");

db.exec("BEGIN");
const sentenceJpnIndicesPath = new URL(
  "../assets/jpn_indices.csv",
  import.meta.url
);
for await (const line of (await fs.open(sentenceJpnIndicesPath)).readLines()) {
  const { sentenceId, meaningId, words } = parseSentenceIndexLine(line);

  db.run(sql`
    INSERT INTO sentence_meanings (sentence, meaning) VALUES
    (${sentenceId}, ${meaningId})
  `);

  let i = 0;
  for (const word of words) {
    i += 1;
    db.run(sql`
      INSERT INTO sentence_words (
        sentence,
        writing,
        word_id,
        reading,
        text,
        sense,
        good_example,
        seq
      ) VALUES (
        ${sentenceId},
        ${word.word},
        ${word.wordId},
        ${word.reading},
        ${word.text},
        ${word.sense},
        ${word.goodExample},
        ${i}
      )
    `);
  }
}
db.exec(`COMMIT`);
