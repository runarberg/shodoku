import { createReadStream } from "node:fs";
import { fileURLToPath } from "node:url";

import Database from "better-sqlite3";
import sax from "sax";

const db = new Database(fileURLToPath(import.meta.resolve("../assets.db")));
db.pragma("journal_mode = WAL");

db.exec("DROP TABLE IF EXISTS words");
db.exec("CREATE TABLE words (id INTEGER PRIMARY KEY)");

db.exec("DROP TABLE IF EXISTS word_writings");
db.exec(`
  CREATE TABLE word_writings (
    word INTEGER NOT NULL REFERENCES words (id),
    text TEXT NOT NULL,
    ateji INTEGER,
    irregular INTEGER,
    rare INTEGER,
    outdated INTEGER,
    search_only INTEGER,
    UNIQUE (word, text ASC)
  )
`);

db.exec("DROP TABLE IF EXISTS word_readings");
db.exec(`
  CREATE TABLE word_readings (
    word INTEGER NOT NULL REFERENCES words (id),
    text TEXT NOT NULL,
    no_kanji INTEGER,
    gikun INTEGER,
    irregular INTEGER,
    rare INTEGER,
    outdated INTEGER,
    search_only INTEGER,
    UNIQUE (word, text ASC)
  )
`);

db.exec("DROP TABLE IF EXISTS word_meanings");
db.exec(`
  CREATE TABLE word_meanings (
    id INTEGER NOT NULL,
    word INTEGER REFERENCES words (id),
    info TEXT,
    pos BLOB,
    misc BLOB,
    kana_preferred INTEGER,
    PRIMARY KEY (id ASC, word)
  )
`);

db.exec("DROP TABLE IF EXISTS word_meaning_glossary");
db.exec(`
  CREATE TABLE word_meaning_glossary (
    word INTEGER NOT NULL REFERENCES words (id),
    meaning INTEGER NOT NULL,
    seq INTEGER NOT NULL,
    text TEXT NOT NULL,
    PRIMARY KEY (word ASC, meaning, seq),
    FOREIGN KEY (word, meaning) REFERENCES word_meanings (word, id)
  )
`);

db.exec("DROP INDEX IF EXISTS word_meaning_glossary_index");
db.exec(
  "CREATE INDEX word_meaning_glossary_index ON word_meaning_glossary (word, text ASC)",
);

db.exec("DROP TABLE IF EXISTS word_priority");
db.exec(`
  CREATE TABLE word_priority (
    word INTEGER NOT NULL REFERENCES words (id),
    writing TEXT,
    reading TEXT,
    freq INTEGER,
    news INTEGER,
    ichi INTEGER,
    spec INTEGER,
    gai INTEGER,
    UNIQUE (word ASC, writing),
    UNIQUE (word ASC, reading),
    FOREIGN KEY (word, writing) REFERENCES word_writings (word, text),
    FOREIGN KEY (word, reading) REFERENCES word_readings (word, text)
  )
`);

db.exec("DROP TABLE IF EXISTS word_reading_writing_pairs");
db.exec(`
  CREATE TABLE word_reading_writing_pairs (
    word INTEGER NOT NULL REFERENCES words (id),
    writing TEXT NOT NULL,
    reading TEXT NOT NULL,
    UNIQUE (word, writing ASC, reading),
    FOREIGN KEY (word, writing) REFERENCES word_writings (word, text),
    FOREIGN KEY (word, reading) REFERENCES word_readings (word, text)
  )
`);

db.exec("DROP TABLE IF EXISTS word_meaning_writing_pairs");
db.exec(`
  CREATE TABLE word_meaning_writing_pairs (
    word INTEGER NOT NULL REFERENCES words (id),
    meaning INTEGER NOT NULL,
    writing TEXT NOT NULL,
    FOREIGN KEY (word, meaning) REFERENCES word_meanings (word, id),
    FOREIGN KEY (word, writing) REFERENCES word_writings (word, text)
  )
`);

db.exec("DROP TABLE IF EXISTS word_meaning_reading_pairs");
db.exec(`
  CREATE TABLE word_meaning_reading_pairs (
    word INTEGER NOT NULL REFERENCES words (id),
    meaning INTEGER NOT NULL,
    reading TEXT NOT NULL,
    FOREIGN KEY (word, meaning) REFERENCES word_meanings (word, id),
    FOREIGN KEY (word, reading) REFERENCES word_readings (word, text)
  )
`);

const insertWord = db.prepare("INSERT INTO words (id) VALUES (?)");
const insertWordWriting = db.prepare(`
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
    @wordId,
    @text,
    @ateji,
    @irregular,
    @rare,
    @outdated,
    @searchOnly
  )
`);

const insertWordReading = db.prepare(`
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
    @wordId,
    @text,
    @noKanji,
    @gikun,
    @irregular,
    @rare,
    @outdated,
    @searchOnly
  )
`);

const insertWordMeaning = db.prepare(`
  INSERT INTO word_meanings (
    id,
    word,
    info,
    pos,
    misc,
    kana_preferred
  )
  VALUES (
    @meaningId,
    @wordId,
    @info,
    @pos,
    @misc,
    @kanaPreferred
  )
`);

const insertWordMeaningGlossary = db.prepare(`
  INSERT INTO word_meaning_glossary (word, meaning, seq, text)
  VALUES (@wordId, @meaningId, @seq, @text)
`);

const insertWordPriority = db.prepare(`
  INSERT INTO word_priority (word, writing, reading, freq, news, ichi, spec, gai)
  VALUES (@wordId, @writing, @reading, @nf, @news, @ichi, @spec, @gai)
`);

const insertReadingWritingPair = db.prepare(`
  INSERT INTO word_reading_writing_pairs (word, writing, reading)
  VALUES (?, ?, ?)
`);

const insertMeaningWritingPair = db.prepare(`
  INSERT INTO word_meaning_writing_pairs (word, meaning, writing)
  VALUES (?, ?, ?)
`);

const insertMeaningReadingPair = db.prepare(`
  INSERT INTO word_meaning_reading_pairs (word, meaning, reading)
  VALUES (?, ?, ?)
`);

const priorityRegExp = /^(news|ichi|spec|gai|nf)(\d\d?)$/;

async function saveEntryToDb(entry) {
  insertWord.run(entry.id);

  for (const writing of entry.kanji) {
    insertWordWriting.run({ wordId: entry.id, ...writing });

    if (writing.priority) {
      const priorities = {
        nf: null,
        news: null,
        ichi: null,
        spec: null,
        gai: null,
      };

      for (const priority of writing.priority) {
        const [, cat, n] = priorityRegExp.exec(priority);
        priorities[cat] = Number.parseInt(n);
      }

      insertWordPriority.run({
        wordId: entry.id,
        writing: writing.text,
        reading: null,
        ...priorities,
      });
    }
  }

  for (const reading of entry.kana) {
    insertWordReading.run({ wordId: entry.id, ...reading });

    if (reading.useWith) {
      for (const writing of reading.useWith) {
        insertReadingWritingPair.run(entry.id, writing, reading.text);
      }
    }

    if (reading.priority) {
      const priorities = {
        nf: null,
        news: null,
        ichi: null,
        spec: null,
        gai: null,
      };

      for (const priority of reading.priority) {
        const [, cat, n] = priorityRegExp.exec(priority);
        priorities[cat] = Number.parseInt(n);
      }

      insertWordPriority.run({
        wordId: entry.id,
        writing: null,
        reading: reading.text,
        ...priorities,
      });
    }
  }

  let meaningId = 0;
  for (const meaning of entry.meanings) {
    meaningId += 1;
    insertWordMeaning.run({
      wordId: entry.id,
      meaningId,
      info: meaning.info,
      pos: JSON.stringify(meaning.pos),
      misc: JSON.stringify(meaning.misc),
      kanaPreferred: meaning.kanaPreferred,
    });

    let glossSeq = 0;
    for (const text of meaning.gloss) {
      glossSeq += 1;
      insertWordMeaningGlossary.run({
        wordId: entry.id,
        meaningId,
        seq: glossSeq,
        text,
      });
    }

    if (meaning.useWithWriting) {
      for (const writing of meaning.useWithWriting) {
        insertMeaningWritingPair.run(entry.id, meaningId, writing);
      }
    }

    if (meaning.useWithReading) {
      for (const reading of meaning.useWithReading) {
        insertMeaningReadingPair.run(entry.id, meaningId, reading);
      }
    }
  }
}

const readStream = createReadStream(
  new URL("../assets/JMdict_e.xml", import.meta.url),
  { encoding: "utf8" },
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
        ateji: 0,
        irregular: 0,
        outdated: 0,
        rare: 0,
        searchOnly: 0,
      };
    } else if (tag.name === "r_ele") {
      kana = {
        text: null,
        noKanji: 0,
        gikun: 0,
        irregular: 0,
        outdated: 0,
        rare: 0,
        searchOnly: 0,
      };
    } else if (tag.name === "re_nokanji") {
      kana.noKanji = 1;
    } else if (tag.name === "sense") {
      meanings = {
        info: null,
        kanaPreferred: 0,
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
        kanji.ateji = 1;
      } else if (text === "&ik;" || text === "&iK;" || text === "&io;") {
        kanji.irregular = 1;
      } else if (text === "&oK;") {
        kanji.outdated = 1;
      } else if (text === "&rK;") {
        kanji.rare = 1;
      } else if (text === "&sK;") {
        kanji.searchOnly = 1;
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
        kana.gikun = 1;
      } else if (text === "&ik;") {
        kana.irregular = 1;
      } else if (text === "&ok;") {
        kana.outdated = 1;
      } else if (text === "&rk;") {
        kana.rare = 1;
      } else if (text === "&sk;") {
        kana.searchOnly = 1;
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
        meanings.kanaPreferred = 1;
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

const finished = new Promise((resolve, reject) => {
  xmlStream.on("end", () => {
    resolve();
  });

  xmlStream.on("error", (error) => {
    reject(error);
  });
});

db.exec("BEGIN");

readStream.pipe(xmlStream);
await finished;

db.exec("COMMIT");

import("./update-db-word-priorities.js");
