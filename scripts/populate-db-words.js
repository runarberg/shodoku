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

await db.exec(sql`DROP TABLE IF EXISTS words`);
await db.exec(sql`
  CREATE TABLE words (
    id INTEGER PRIMARY KEY
  )
`);

await db.exec(sql`DROP TABLE IF EXISTS word_writings`);
await db.exec(sql`
  CREATE TABLE word_writings (
    word INTEGER REFERENCES words (id),
    text TEXT,
    ateji INTEGER,
    irregular INTEGER,
    rare INTEGER,
    outdated INTEGER,
    search_only INTEGER,
    UNIQUE (word, text)
  )
`);

await db.exec(sql`DROP INDEX IF EXISTS writing_index`);
await db.exec(sql`CREATE INDEX writing_index ON word_writings (word, text)`);

await db.exec(sql`DROP TABLE IF EXISTS word_readings`);
await db.exec(sql`
  CREATE TABLE word_readings (
    word INTEGER REFERENCES words (id),
    text TEXT,
    no_kanji INTEGER,
    gikun INTEGER,
    irregular INTEGER,
    rare INTEGER,
    outdated INTEGER,
    search_only INTEGER,
    UNIQUE (word, text)
  )
`);

await db.exec(sql`DROP INDEX IF EXISTS reading_index`);
await db.exec(sql`CREATE INDEX reading_index ON word_readings (word, text)`);

await db.exec(sql`DROP TABLE IF EXISTS word_meanings`);
await db.exec(sql`
  CREATE TABLE word_meanings (
    id INTEGER,
    word INTEGER REFERENCES words (id),
    info TEXT,
    pos BLOB,
    misc BLOB,
    kana_preferred INTEGER,
    PRIMARY KEY (id, word)
  )
`);

await db.exec(sql`DROP TABLE IF EXISTS word_meaning_glossary`);
await db.exec(sql`
  CREATE TABLE word_meaning_glossary (
    word INTEGER REFERENCES words (id),
    word_meaning INTEGER REFERENCES word_meanings (id),
    seq INTEGER NOT NULL,
    text TEXT,
    PRIMARY KEY (word, word_meaning, seq)
  )
`);

await db.exec(sql`DROP TABLE IF EXISTS word_priority`);
await db.exec(sql`
  CREATE TABLE word_priority (
    word INTEGER REFERENCES words (id),
    writing TEXT REFERENCES word_writings (text),
    reading TEXT REFERENCES word_readings (text),
    freq INTEGER,
    news INTEGER,
    ichi INTEGER,
    spec INTEGER,
    gai INTEGER
  )
`);

await db.exec(sql`DROP TABLE IF EXISTS word_reading_writing_pairs`);
await db.exec(sql`
  CREATE TABLE word_reading_writing_pairs (
    word INTEGER REFERENCES words (id),
    writing TEXT REFERENCES word_writings (text),
    reading TEXT REFERENCES word_readings (text)
  )
`);

await db.exec(sql`DROP TABLE IF EXISTS word_meaning_writing_pairs`);
await db.exec(sql`
  CREATE TABLE word_meaning_writing_pairs (
    word INTEGER REFERENCES words (id),
    writing TEXT REFERENCES word_writings (text),
    word_meanings INTEGER REFERENCES word_meanings (id)
  )
`);

await db.exec(sql`DROP TABLE IF EXISTS word_meaning_reading_pairs`);
await db.exec(sql`
  CREATE TABLE word_meaning_reading_pairs (
    word INTEGER REFERENCES words (id),
    reading TEXT REFERENCES word_readings (text),
    word_meanings INTEGER REFERENCES word_meanings (id)
  )
`);

const priorityRegExp = /^(news|ichi|spec|gai|nf)(\d\d?)$/;

async function saveEntryToDb(entry) {
  db.run(sql`
    INSERT INTO words (id)
    VALUES (${entry.id})
  `);

  for (const writing of entry.kanji) {
    db.run(sql`
      INSERT INTO word_writings (
        word,
        text,
        ateji,
        irregular,
        rare,
        outdated,
        search_only
      )
      VALUES (
        ${entry.id},
        ${writing.text},
        ${writing.ateji},
        ${writing.irregular},
        ${writing.rare},
        ${writing.outdated},
        ${writing.searchOnly}
      )
    `);

    if (writing.priority) {
      const priorities = {};

      for (const priority of writing.priority) {
        const [, cat, n] = priorityRegExp.exec(priority);
        priorities[cat] = Number.parseInt(n);
      }

      db.run(sql`
        INSERT INTO word_priority (word, writing, freq, news, ichi, spec, gai)
        VALUES (
          ${entry.id},
          ${writing.text},
          ${priorities.nf},
          ${priorities.news},
          ${priorities.ichi},
          ${priorities.spec},
          ${priorities.gai}
        )
      `);
    }
  }

  for (const reading of entry.kana) {
    db.run(sql`
      INSERT INTO word_readings (
        word,
        text,
        no_kanji,
        gikun,
        irregular,
        rare,
        outdated,
        search_only
      )
      VALUES (
        ${entry.id},
        ${reading.text},
        ${reading.noKanji},
        ${reading.gikun},
        ${reading.irregular},
        ${reading.rare},
        ${reading.outdated},
        ${reading.searchOnly}
      )
    `);

    if (reading.useWith) {
      for (const writing of reading.useWith) {
        db.run(sql`
          INSERT INTO word_reading_writing_pairs (word, writing, reading)
          VALUES (${entry.id}, ${writing}, ${reading.text})
        `);
      }
    }

    if (reading.priority) {
      const priorities = {};

      for (const priority of reading.priority) {
        const [, cat, n] = priorityRegExp.exec(priority);
        priorities[cat] = Number.parseInt(n);
      }

      db.run(sql`
        INSERT INTO word_priority (word, reading, freq, news, ichi, spec, gai)
        VALUES (
          ${entry.id},
          ${reading.text},
          ${priorities.nf},
          ${priorities.news},
          ${priorities.ichi},
          ${priorities.spec},
          ${priorities.gai}
        )
      `);
    }
  }

  let meaningId = 0;
  for (const meaning of entry.meanings) {
    meaningId += 1;
    db.run(
      sql`
      INSERT INTO word_meanings (
        id,
        word,
        info,
        pos,
        misc,
        kana_preferred
      )
      VALUES (
        ${meaningId},
        ${entry.id},
        ${meaning.info},
        ${JSON.stringify(meaning.pos)},
        ${JSON.stringify(meaning.misc)},
        ${meaning.kanaPreferred}
      )
    `
    );

    let glossSeq = 0;
    for (const text of meaning.gloss) {
      glossSeq += 1;
      db.run(sql`
        INSERT INTO word_meaning_glossary (word, word_meaning, seq, text)
        VALUES (${entry.id}, ${meaningId}, ${glossSeq}, ${text})
      `);
    }

    if (meaning.useWithWriting) {
      for (const writing of meaning.useWithWriting) {
        db.run(sql`
          INSERT INTO word_meaning_writing_pairs (word, writing, word_meanings)
          VALUES (${entry.id}, ${writing}, ${meaningId})
        `);
      }
    }

    if (meaning.useWithReading) {
      for (const reading of meaning.useWithReading) {
        db.run(sql`
          INSERT INTO word_meaning_reading_pairs (word, reading, word_meanings)
          VALUES (${entry.id}, ${reading}, ${meaningId})
        `);
      }
    }
  }
}

const readStream = createReadStream(
  new URL("../assets/JMdict_e.xml", import.meta.url),
  { encoding: "utf8" }
);

const xmlStream = sax.createStream(false, {
  lowercase: true,
});

{
  let tag = null;
  let entry = null;
  let kanji = null;
  let kana = null;
  let meanings = null;

  xmlStream.on("opentag", (opentag) => {
    tag = opentag;

    if (tag.name === "entry") {
      entry = {
        id: null,
        kanji: [],
        kana: [],
        meanings: [],
      };
    } else if (tag.name === "k_ele") {
      kanji = {
        text: null,
      };
    } else if (tag.name === "r_ele") {
      kana = {
        text: null,
      };
    } else if (tag.name === "re_nokanji") {
      kana.noKanji = true;
    } else if (tag.name === "sense") {
      meanings = {
        gloss: [],
        pos: [],
        misc: [],
      };
    }
  });

  xmlStream.on("closetag", (closetagName) => {
    tag = null;

    if (closetagName === "entry") {
      saveEntryToDb(entry);
      entry = null;
    } else if (closetagName === "k_ele") {
      entry.kanji.push(kanji);
      kanji = null;
    } else if (closetagName === "r_ele") {
      entry.kana.push(kana);
      kana = null;
    } else if (closetagName === "sense") {
      entry.meanings.push(meanings);
      meanings = null;
    }
  });

  xmlStream.on("text", (text) => {
    if (!tag) {
      return;
    }

    if (tag.name === "ent_seq") {
      entry.id = text;
    } else if (tag.name === "keb") {
      kanji.text = text;
    } else if (tag.name === "ke_inf") {
      if (text === "&ateji;") {
        kanji.ateji = true;
      } else if (text === "&ik;" || text === "&iK;" || text === "&io;") {
        kanji.irregular = true;
      } else if (text === "&oK;") {
        kanji.outdated = true;
      } else if (text === "&rK;") {
        kanji.rare = true;
      } else if (text === "&sK;") {
        kanji.searchOnly = true;
      }
    } else if (tag.name === "ke_pri") {
      if (!kanji.priority) {
        kanji.priority = [];
      }
      kanji.priority.push(text);
    } else if (tag.name === "reb") {
      kana.text = text;
    } else if (tag.name === "re_inf") {
      if (text === "&gikun;") {
        kana.gikun = true;
      } else if (text === "&ik;") {
        kana.irregular = true;
      } else if (text === "&ok;") {
        kana.outdated = true;
      } else if (text === "&rk;") {
        kana.rare = true;
      } else if (text === "&sk;") {
        kana.searchOnly = true;
      }
    } else if (tag.name === "re_pri") {
      if (!kana.priority) {
        kana.priority = [];
      }
      kana.priority.push(text);
    } else if (tag.name === "re_restr") {
      if (!kana.useWith) {
        kana.useWith = [];
      }
      kana.useWith.push(text);
    } else if (tag.name === "s_inf") {
      meanings.info = text;
    } else if (tag.name === "stagk") {
      if (!meanings.useWithWriting) {
        meanings.useWithWriting = [];
      }
      meanings.useWithWriting.push(text);
    } else if (tag.name === "stagr") {
      if (!meanings.useWithReading) {
        meanings.useWithReading = [];
      }
      meanings.useWithReading.push(text);
    } else if (tag.name === "misc") {
      if (text === "&uk;") {
        meanings.kanaPreferred = true;
      } else {
        meanings.misc.push(text.slice(1, -1));
      }
    } else if (tag.name === "pos") {
      if (text === "∫") {
        // &int; entity
        meanings.pos.push("int");
      } else {
        meanings.pos.push(text.slice(1, -1));
      }
    } else if (tag.name === "gloss") {
      meanings.gloss.push(text);
    }
  });
}

db.exec("BEGIN");
xmlStream.on("end", () => {
  db.exec("COMMIT");
});

readStream.pipe(xmlStream);
