import { createReadStream } from "node:fs";
import { fileURLToPath } from "node:url";

import Database from "better-sqlite3";
import sax from "sax";

const db = new Database(fileURLToPath(import.meta.resolve("../assets.db")));
db.pragma("journal_mode = WAL");

function* enumerate(iterable) {
  let i = 0;
  for (const item of iterable) {
    yield [i, item];

    i += 1;
  }
}

db.exec(`DROP TABLE IF EXISTS kanji`);
db.exec(`
  CREATE TABLE kanji (
    codepoint INTEGER PRIMARY KEY,
    literal TEXT NOT NULL,
    radical INTEGER,
    freq INTEGER,
    grade TEXT,
    stroke_count INTEGER
  )
`);

db.exec(`DROP TABLE IF EXISTS kanji_readings`);
db.exec(`
  CREATE TABLE kanji_readings (
    kanji INTEGER REFERENCES kanji (codepoint) NOT NULL,
    type TEXT NOT NULL,
    text TEXT NOT NULL,
    seq INTIGER,
    PRIMARY KEY (kanji ASC, type, seq)
  )
`);

db.exec(`DROP TABLE IF EXISTS kanji_meanings`);
db.exec(`
  CREATE TABLE kanji_meanings (
    kanji INTEGER REFERENCES kanji (codepoint) NOT NULL,
    text TEXT NOT NULL,
    seq INTEGER NOT NULL,
    PRIMARY KEY (kanji ASC, seq)
  )
`);

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

const insertCharacter = db.transaction(
  (kanji, onReadings, kunReadings, meanings) => {
    insertKanji.run(kanji);

    for (const [seq, reading] of enumerate(onReadings)) {
      insertKanjiReading.run({
        codepoint: kanji.codepoint,
        type: "on",
        reading,
        seq,
      });
    }

    for (const [seq, reading] of enumerate(kunReadings)) {
      insertKanjiReading.run({
        codepoint: kanji.codepoint,
        type: "kun",
        reading,
        seq,
      });
    }

    for (const [seq, meaning] of enumerate(meanings)) {
      insertKanjiMeaning.run({ codepoint: kanji.codepoint, meaning, seq });
    }
  }
);

const readStream = createReadStream(
  new URL("../assets/kanjidic2.xml", import.meta.url),
  { encoding: "utf8" }
);

const xmlStream = sax.createStream(true);

{
  let tag = null;
  let literal = null;
  let codepoint = null;
  let radical = null;
  let strokeCount = null;
  let freq = null;
  let grade = null;
  let onReadings = null;
  let kunReadings = null;
  let meanings = null;

  xmlStream.on("opentag", (opentag) => {
    tag = opentag;

    if (tag.name === "character") {
      onReadings = [];
      kunReadings = [];
      meanings = [];
    }
  });

  xmlStream.on("closetag", (tagName) => {
    tag = null;

    if (tagName === "character") {
      const kanji = {
        codepoint,
        literal,
        radical,
        grade,
        freq,
        strokeCount,
      };

      insertCharacter(kanji, onReadings, kunReadings, meanings);

      literal = null;
      codepoint = null;
      radical = null;
      strokeCount = null;
      freq = null;
      grade = null;
      onReadings = null;
      kunReadings = null;
      meanings = null;
    }
  });

  xmlStream.on("text", (text) => {
    if (!tag) {
      return;
    }

    if (tag.name === "literal") {
      literal = text;
    } else if (tag.name === "grade") {
      grade = text;
    } else if (tag.name === "freq") {
      freq = Number.parseInt(text);
    } else if (tag.name === "stroke_count") {
      strokeCount = Number.parseInt(text);
    } else if (tag.name === "cp_value") {
      if (tag.attributes.cp_type === "ucs") {
        codepoint = Number.parseInt(text, 16);
      }
    } else if (tag.name === "rad_value") {
      if (tag.attributes.rad_type === "classical") {
        radical = Number.parseInt(text);
      }
    } else if (tag.name === "reading") {
      if (tag.attributes.r_type === "ja_on") {
        onReadings.push(text);
      } else if (tag.attributes.r_type === "ja_kun") {
        kunReadings.push(text);
      }
    } else if (tag.name === "meaning") {
      if (!tag.attributes.m_lang) {
        meanings.push(text);
      }
    }
  });
}

readStream.pipe(xmlStream);
