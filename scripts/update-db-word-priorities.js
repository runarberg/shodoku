import { fileURLToPath } from "node:url";

import Database from "better-sqlite3";

const db = new Database(fileURLToPath(import.meta.resolve("../assets.db")));
db.pragma("journal_mode = WAL");

// Add some extra priorities
const updateReadingPriority = db.prepare(`
  UPDATE word_priority
  SET freq = @value
  WHERE
    reading = @reading
    AND word = (
      SELECT word FROM word_writings WHERE word_writings.text = @writing
    )
`);

updateReadingPriority.run({
  writing: "今日",
  reading: "きょう",
  value: 1,
});

updateReadingPriority.run({
  writing: "明日",
  reading: "あした",
  value: 1,
});

updateReadingPriority.run({
  writing: "昨日",
  reading: "きのう",
  value: 1,
});

updateReadingPriority.run({
  writing: "日曜日",
  reading: "にちようび",
  value: 15,
});

updateReadingPriority.run({
  writing: "月曜日",
  reading: "げつようび",
  value: 16,
});

updateReadingPriority.run({
  writing: "火曜日",
  reading: "かようび",
  value: 17,
});

updateReadingPriority.run({
  writing: "水曜日",
  reading: "すいようび",
  value: 18,
});

updateReadingPriority.run({
  writing: "木曜日",
  reading: "もくようび",
  value: 19,
});

updateReadingPriority.run({
  writing: "金曜日",
  reading: "きんようび",
  value: 20,
});

updateReadingPriority.run({
  writing: "土曜日",
  reading: "どようび",
  value: 21,
});

updateReadingPriority.run({
  writing: "一昨日",
  reading: "おととい",
  value: 30,
});

updateReadingPriority.run({
  writing: "明後日",
  reading: "あさって",
  value: 31,
});
