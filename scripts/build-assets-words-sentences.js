import fs from "node:fs/promises";
import { DatabaseSync as Database } from "node:sqlite";

await fs.mkdir(new URL("../public/data/words-sentences-v2", import.meta.url), {
  recursive: true,
});

const db = new Database(new URL("../assets.db", import.meta.url), {
  readOnly: true,
});

const selectWords = db.prepare(`
  SELECT
    words.id as id,
    json_group_array(
      json_object(
        'sentence', sentence_words.sentence,
        'meaning', coalesce(sentence_words.meaning, 1)
      ) ORDER BY sentence_words.meaning
    ) as sentences
  FROM words
  LEFT OUTER JOIN sentence_words ON sentence_words.word = words.id
  WHERE sentence_words.good_example = 1
  GROUP BY words.id
`);

for (const row of selectWords.iterate()) {
  const fileURL = new URL(
    `../public/data/words-sentences-v2/${row.id}.json`,
    import.meta.url,
  );

  fs.writeFile(fileURL, row.sentences);
}
