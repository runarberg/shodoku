import { createReadStream } from "node:fs";
import { fileURLToPath } from "node:url";

import sax from "sax";
import sql from "sql-template-strings";
import { open as opendb } from "sqlite";
import sqlite3 from "sqlite3";

const db = await opendb({
  filename: fileURLToPath(import.meta.resolve("../assets.db")),
  driver: sqlite3.Database,
});

function* enumerate(iterable) {
  let i = 0;
  for (const item of iterable) {
    yield [i, item];

    i += 1;
  }
}

await db.exec(sql`DROP TABLE IF EXISTS kanji`);
await db.exec(sql`
  CREATE TABLE kanji (
    codepoint INTEGER PRIMARY KEY,
    literal TEXT NOT NULL,
    radical INTEGER,
    freq INTEGER,
    grade TEXT,
    stroke_count INTEGER
  )
`);

await db.exec(sql`DROP TABLE IF EXISTS kanji_readings`);
await db.exec(sql`
  CREATE TABLE kanji_readings (
    kanji INTEGER REFERENCES kanji (codepoint),
    type TEXT NOT NULL,
    text TEXT NOT NULL,
    seq INTIGER,
    UNIQUE (kanji, type, seq)
  )
`);

await db.exec(sql`DROP TABLE IF EXISTS kanji_meanings`);
await db.exec(sql`
  CREATE TABLE kanji_meanings (
    kanji INTEGER REFERENCES kanji (codepoint),
    text TEXT NOT NULL,
    seq INTEGER NOT NULL,
    UNIQUE (kanji, seq)
  )
`);

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
      db.exec("BEGIN");
      const stmt = sql`
        INSERT INTO kanji (codepoint, literal, radical, grade, freq, stroke_count)
        VALUES (${codepoint}, ${literal}, ${radical}, ${grade}, ${freq}, ${strokeCount})
      `;
      db.run(stmt);

      for (const [seq, reading] of enumerate(onReadings)) {
        db.run(sql`
          INSERT INTO kanji_readings (kanji, type, text, seq)
          VALUES (${codepoint}, 'on', ${reading}, ${seq})
        `);
      }

      for (const [seq, reading] of enumerate(kunReadings)) {
        db.run(sql`
          INSERT INTO kanji_readings (kanji, type, text, seq)
          VALUES (${codepoint}, 'kun', ${reading}, ${seq})
        `);
      }

      for (const [seq, meaning] of enumerate(meanings)) {
        db.run(sql`
          INSERT INTO kanji_meanings (kanji, text, seq)
          VALUES (${codepoint}, ${meaning}, ${seq})
        `);
      }

      db.exec("COMMIT");

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
