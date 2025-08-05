import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

import Database from "better-sqlite3";

import { parseSentenceIndexLine } from "./parsers.js";

const db = new Database(fileURLToPath(import.meta.resolve("../assets.db")));
db.pragma("journal_mode = WAL");

db.exec(`DROP TABLE IF EXISTS sentence_meanings`);
db.exec("DROP TABLE IF EXISTS sentence_words");
db.exec("DROP TABLE IF EXISTS sentences");

db.exec(`
  CREATE TABLE sentences (
    id INTEGER PRIMARY KEY,
    lang TEXT NOT NULL,
    text TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE sentence_words (
    sentence INTEGER NOT NULL REFERENCES sentences (id),
    word INTEGER REFERENCES words (id),
    writing TEXT,
    reading TEXT,
    meaning INTEGER,
    text TEXT,
    good_example INTEGER,
    seq INTEGER NOT NULL,
    PRIMARY KEY (sentence ASC, seq ASC),
    FOREIGN KEY (word, writing) REFERENCES word_writings (word, text),
    FOREIGN KEY (word, reading) REFERENCES word_readings (word, text)
  )
`);

db.exec(`DROP INDEX IF EXISTS sentence_word_writing_index`);
db.exec(`
  CREATE INDEX sentence_word_index ON sentence_words (word, writing ASC)
`);

db.exec(`DROP INDEX IF EXISTS sentence_word_reading_index`);
db.exec(`
  CREATE INDEX sentence_word_reading_index ON sentence_words(word, reading ASC)
`);

db.exec(`DROP INDEX IF EXISTS sentence_word_text_index`);
db.exec(`
  CREATE INDEX sentence_word_text_index ON sentence_words(text)
`);

db.exec(`
  CREATE TABLE sentence_meanings (
    sentence INTEGER NOT NULL REFERENCES sentences (id),
    meaning INTEGER NOT NULL REFERENCES sentences (id),
    PRIMARY KEY (sentence ASC)
  )
`);

const insertSentence = db.prepare(`
  INSERT INTO sentences (id, lang, text)
  VALUES (?, ?, ?)
`);

const insertSentenceMeaning = db.prepare(`
  INSERT INTO sentence_meanings (sentence, meaning)
  VALUES (?, ?)
`);

const insertSentenceWordWriting = db.prepare(`
  INSERT INTO sentence_words (
    sentence,
    seq,
    word,
    writing,
    text,
    meaning,
    good_example
  )
  VALUES (
    @sentenceId,
    @seq,
    coalesce(
      @word,
      (
        SELECT word
        FROM word_writings
        WHERE text = @writing
      )
    ),
    @writing,
    @text,
    @meaning,
    @goodExample
  )
`);

const insertSentenceWordReading = db.prepare(`
  INSERT INTO sentence_words (
    sentence,
    seq,
    word,
    reading,
    text,
    meaning,
    good_example
  )
  VALUES (
    @sentenceId,
    @seq,
    coalesce(
      @word,
      (
        SELECT word
        FROM word_readings
        WHERE text = @reading
      )
    ),
    @reading,
    @text,
    @meaning,
    @goodExample
  )
`);

const insertSentenceWordReadingWriting = db.prepare(`
  INSERT INTO sentence_words (
    sentence,
    seq,
    word,
    writing,
    reading,
    text,
    meaning,
    good_example
  )
  VALUES (
    @sentenceId,
    @seq,
    coalesce(
      @word,
      (
        SELECT word_writings.word
        FROM word_writings
        INNER JOIN word_readings ON word_readings.word = word_writings.word
        WHERE
          word_writings.text = @writing AND word_readings.text = @reading
      )
    ),
    @writing,
    @reading,
    @text,
    @meaning,
    @goodExample
  )
`);

const insertSentenceWord = db.prepare(
  `
  INSERT INTO sentence_words (
    sentence,
    seq,
    text,
    meaning,
    good_example
  )
  VALUES (
    @sentenceId,
    @seq,
    @text,
    @meaning,
    @goodExample
  )
`,
);

db.exec("BEGIN");
const sentencesJpnPath = new URL(
  "../assets/jpn_sentences.tsv",
  import.meta.url,
);
for await (const line of (await fs.open(sentencesJpnPath)).readLines()) {
  const [id, lang, text] = line.split("\t");

  insertSentence.run(Number.parseInt(id), lang, text);
}
db.exec("COMMIT");

db.exec("BEGIN");
const sentencesEngPath = new URL(
  "../assets/eng_sentences.tsv",
  import.meta.url,
);
for await (const line of (await fs.open(sentencesEngPath)).readLines()) {
  const [id, lang, text] = line.split("\t");

  insertSentence.run(Number.parseInt(id), lang, text);
}
db.exec("COMMIT");

db.exec("BEGIN");
const sentenceJpnIndicesPath = new URL(
  "../assets/jpn_indices.csv",
  import.meta.url,
);
let i = 0;
for await (const line of (await fs.open(sentenceJpnIndicesPath)).readLines()) {
  const { sentenceId, meaningId, words } = parseSentenceIndexLine(line);

  try {
    insertSentenceMeaning.run(sentenceId, meaningId);
  } catch {
    // eslint-disable-next-line no-console
    console.error("Failed sentence meaning", sentenceId, meaningId);
    continue;
  }

  let seq = 0;
  for (const word of words) {
    seq += 1;
    const entry = { sentenceId, seq, ...word };

    try {
      if (word.reading && word.writing) {
        insertSentenceWordReadingWriting.run(entry);
      } else if (word.reading) {
        insertSentenceWordReading.run(entry);
      } else {
        insertSentenceWordWriting.run(entry);
      }
    } catch {
      // Word not found. Write the entry as a standalone text.
      entry.text = entry.text || entry.writing || entry.reading;
      // eslint-disable-next-line no-console
      console.error("Failed sentence word", sentenceId, entry);

      try {
        insertSentenceWord.run(entry);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    }
  }
  i += 1;
  if (i % 1000 === 0) {
    // eslint-disable-next-line no-console
    console.log(i, sentenceId);
  }
}

db.exec(`COMMIT`);
