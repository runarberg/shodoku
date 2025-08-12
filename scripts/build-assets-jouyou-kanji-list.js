// NOTE: **Do not** run this as part of a CD pipeline. The output
// needs to be manually verified and exists in version control.

import fs from "node:fs/promises";

import { DOMParser } from "@xmldom/xmldom";
import { pipe } from "yta";
import { filter, groupBy, map } from "yta/sync";

// Fetch the list from wikipedia.
const LIST_URL = "https://en.wikipedia.org/wiki/List_of_j%C5%8Dy%C5%8D_kanji";
const html = await (await fetch(LIST_URL)).text();

const parser = new DOMParser();
const dom = parser.parseFromString(html, "text/html");

// Get the first table in the article.
// This may fail if the article is edited.
const [main] = dom.getElementsByTagName("main");
const [table] = main.getElementsByClassName("wikitable");
const [tbody] = table.getElementsByTagName("tbody");

const kanjiByGrade = pipe(
  tbody.getElementsByTagName("tr"),
  map((tr) =>
    pipe(
      tr.getElementsByTagName("td"),
      map((td) => td.textContent),
      ([n, literal, , radical, strokes, grade]) => ({
        n: Number.parseInt(n),
        literal: literal ? String.fromCodePoint(literal.codePointAt(0)) : "",
        radical,
        strokes: Number.parseInt(strokes),
        grade: Number.parseInt(grade) || grade,
      }),
    ),
  ),
  filter(({ n }) => n),
  groupBy(({ grade }) => grade),
);

const listDir = new URL("../public/data/kanji-lists/", import.meta.url);

for (const [grade, list] of kanjiByGrade) {
  list.sort((a, b) => {
    if (a.strokes !== b.strokes) {
      return a.strokes - b.strokes;
    }

    return a.n - b.n;
  });

  const gradeStr =
    typeof grade === "number"
      ? grade.toString().padStart(2, "0")
      : grade.toLowerCase();

  const fileURL = new URL(`jouyou-grade-${gradeStr}.csv`, listDir);
  await fs.writeFile(fileURL, list.map(({ literal }) => literal).join("\n"), {
    encoding: "utf8",
  });
}
