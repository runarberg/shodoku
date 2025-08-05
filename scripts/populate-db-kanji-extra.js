import { fileURLToPath } from "node:url";

import Database from "better-sqlite3";

const db = new Database(fileURLToPath(import.meta.resolve("../assets.db")));
db.pragma("journal_mode = WAL");

const extraKanji = [
  {
    codepoint: 0x3005,
    meanings: ["iteration mark", "same character mark"],
    kunYomi: ["のま"],
    onYomi: ["ノマ"],
    radical: null,
    grade: null,
    freq: null,
    strokeCount: 3,
  },
  {
    codepoint: 0x4e1a,
    meanings: ["north"],
    kunYomi: ["きた"],
    onYomi: ["ホク"],
    radical: 1,
    grade: null,
    freq: null,
    strokeCount: 5,
  },
];

const insertKanji = db.prepare(`
  INSERT INTO kanji (codepoint, literal, radical, grade, freq, stroke_count)
  VALUES (@codepoint, @literal, @radical, @grade, @freq, @strokeCount)
`);

const insertKanjiReading = db.prepare(`
  INSERT INTO kanji_readings (kanji, type, text, seq)
  VALUES (@codepoint, @type, @reading, @seq)
`);

const insertKanjiMeaning = db.prepare(`
  INSERT INTO kanji_meanings (kanji, text, seq)
  VALUES (@codepoint, @meaning, @seq)
`);

for (const { kunYomi, onYomi, meanings, ...kanji } of extraKanji) {
  insertKanji.run({
    literal: String.fromCodePoint(kanji.codepoint),
    ...kanji,
  });

  let seq = 0;
  for (const reading of kunYomi) {
    seq += 1;
    insertKanjiReading.run({
      codepoint: kanji.codepoint,
      type: "kun",
      reading,
      seq,
    });
  }

  seq = 0;
  for (const reading of onYomi) {
    seq += 1;
    insertKanjiReading.run({
      codepoint: kanji.codepoint,
      type: "on",
      reading,
      seq,
    });
  }

  seq = 0;
  for (const meaning of meanings) {
    seq += 1;
    insertKanjiMeaning.run({ codepoint: kanji.codepoint, meaning, seq });
  }
}
