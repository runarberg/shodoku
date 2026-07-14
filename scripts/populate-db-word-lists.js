import fs from "node:fs/promises";
import { DatabaseSync as Database } from "node:sqlite";

const db = new Database(import.meta.resolve("../assets.db"));

db.exec("DROP TABLE IF EXISTS word_lists");
db.exec(`
  CREATE TABLE word_lists (
    name TEXT PRIMARY KEY,
    priority INTEGER NOT NULL
  )
`);

db.exec("DROP TABLE IF EXISTS word_list_words");
db.exec(`
  CREATE TABLE word_list_words (
    list TEXT NOT NULL REFERENCES word_lists (name),
    writing TEXT,
    reading TEXT,
    UNIQUE (list, writing ASC, reading)
  )
`);

const insertWordList = db.prepare(
  "INSERT INTO word_lists (name, priority) VALUES (?, ?)",
);
const insertWord = db.prepare(`
  INSERT INTO word_list_words (list, writing, reading) VALUES (?, ?, ?)
`);

const lists = [
  ["jlpt-n5", 1],
  ["jlpt-n4", 2],
  ["jlpt-n3", 3],
  ["jlpt-n2", 4],
  ["jlpt-n1", 5],
];

for (const [listName, priority] of lists) {
  const fileURL = new URL(
    `../assets/word-lists/${listName}.csv`,
    import.meta.url,
  );

  db.exec("BEGIN");
  insertWordList.run(listName, priority);

  for await (const line of (await fs.open(fileURL)).readLines()) {
    const [writing, reading] = line.split(",");

    insertWord.run(listName, writing || null, reading || null);
  }

  db.exec("COMMIT");
}
