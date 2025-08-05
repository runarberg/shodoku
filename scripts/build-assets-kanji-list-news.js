import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

import Database from "better-sqlite3";

const db = new Database(fileURLToPath(import.meta.resolve("../assets.db")));
db.pragma("journal_mode = WAL");

const selectKanji = db.prepare(`
  SELECT literal
  FROM kanji
  WHERE freq >= ? AND freq <= ? AND freq
  ORDER BY freq
`);

const groups = [
  { name: "top-50", range: [1, 50] },
  { name: "top-100", range: [51, 100] },
  { name: "top-200", range: [101, 200] },
  { name: "top-500", range: [201, 500] },
  { name: "top-1000", range: [501, 1000] },
  { name: "top-2500", range: [1001, 2501] },
];

for (const { name, range } of groups) {
  const fileURL = new URL(
    `../public/data/kanji-lists/news-${name}.csv`,
    import.meta.url,
  );

  let content = "";
  for (const { literal } of selectKanji.all(range[0], range[1])) {
    content += `${literal}\n`;
  }

  fs.writeFile(fileURL, content);
}
