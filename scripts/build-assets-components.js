import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { DOMParser } from "@xmldom/xmldom";
import Database from "better-sqlite3";
import { pipe } from "yta";
import { groupBy, toArray } from "yta/sync";

const db = new Database(fileURLToPath(import.meta.resolve("../assets.db")));

const selectKanji = db.prepare(`
  SELECT
    literal,
    (
      SELECT kanji_meanings.text
      FROM kanji_meanings
      WHERE kanji_meanings.kanji = kanji.codepoint
      ORDER BY seq
      LIMIT 1
    ) as meaning,
    (
      SELECT kanji_readings.text
      FROM kanji_readings
      WHERE
        kanji_readings.kanji = kanji.codepoint
        AND kanji_readings.type = 'on'
      ORDER BY seq
      LIMIT 1
    ) as on_yomi,
    (
      SELECT kanji_readings.text
      FROM kanji_readings
      WHERE
        kanji_readings.kanji = kanji.codepoint
        AND kanji_readings.type = 'kun'
      ORDER BY seq
      LIMIT 1
    ) as kun_yomi
  FROM kanji
  WHERE literal = ?
`);

const radicalInfo = new Map();
{
  const csvFile = await fs.open(new URL("../assets/radicals.csv", import.meta.url));
  for await (const line of csvFile.readLines({ encoding:  "utf-8" })) {
    const [number, literals,, en, jp] = line.split(/\s*,\s*/);
    const info = { number: Number.parseInt(number), en, jp };

    for (const literal of literals) {
      radicalInfo.set(literal, info);
    }
  }
}

function isKanji(codepoint) {
  return (
    (codepoint >= 0x4e00 && codepoint <= 0x9fc3)
      || (codepoint >= 0x3400 && codepoint <= 0x4dbf)
      || (codepoint >= 0x20000 && codepoint <= 0x2a6df)
      || (codepoint >= 0x2a700 && codepoint <= 0x2b73f)
      || (codepoint >= 0x2b740 && codepoint <= 0x2b81f)
      || (codepoint >= 0x2b820 && codepoint <= 0x2ceaf)
      || (codepoint >= 0x2ceb0 && codepoint <= 0x2ebef)
      || (codepoint >= 0x30000 && codepoint <= 0x3134f)
      || (codepoint >= 0x31350 && codepoint <= 0x323af)
      || (codepoint >= 0x2ebf0 && codepoint <= 0x2ee5f)
  );
}

const kanjivgDirURL = new URL("../public/kanjivg/kanji/", import.meta.url);
const domParser = new DOMParser();

const kanjiStrokeCounts = new Map();
const componentVariations = new Map();
const componentVariationOf = new Map();

const radicalMap = new Map();
let kanjiComponentMap = new Map();
for await (const filename of fs.glob("*.svg", { cwd: kanjivgDirURL.pathname })) {
  const codepoint = Number.parseInt(filename.slice(0, 5), 16);
  const kanji = String.fromCodePoint(codepoint);

  if (!isKanji(codepoint)) {
    continue;
  }

  const pathURL = new URL(filename, kanjivgDirURL);
  const xml = (await fs.readFile(pathURL, "utf-8")).replace(
    // Fix missing namespace
    `xmlns="http://www.w3.org/2000/svg"`,
    `xmlns="http://www.w3.org/2000/svg" xmlns:kvg="https://kanjivg.tagaini.net/svg-format.html"`,
  );
  const dom = domParser.parseFromString(xml, "text/xml");

  const components = new Set();
  for (const g of dom.getElementsByTagName("g")) {
    const element = g.getAttribute("kvg:element");

    if (!element) {
      continue;
    }

    components.add(element);

    const original = g.getAttribute("kvg:original");

    if (original && element !== original) {
      let variations = componentVariations.get(original);
      if (!variations) {
        variations = new Set();
        componentVariations.set(original, variations);
      }
      variations.add(element);

      let variationOf = componentVariationOf.get(element);
      if (!variationOf) {
        variationOf = new Set();
        componentVariationOf.set(element, variationOf);
      }
      variationOf.add(original);
    }

    if (g.hasAttribute("kvg:radical") && !radicalMap.has(element)) {
      // 士 can either be original or a variant or of 土.
      const isOriginal = radicalInfo.has(element);

      radicalMap.set(
        element,
        { original: isOriginal ? element : original ?? element },
      );
    }
  }

  if (!kanjiStrokeCounts.has(kanji)) {
    kanjiStrokeCounts.set(kanji, dom.getElementsByTagName("path").length);
  }

  kanjiComponentMap.set(kanji, components);
}

// These are exceptions from the kanjivg dataset. These are using the
// characters from the radical unicode block instead of the CJK
// codeblock as is usual. In these cases, the whole character is the
// only one denoted with the CJK block while the parts are all from
// the radical block.
//
// See: https://kanjivg.tagaini.net/radicals.html#other-radicals
const rogueCJKRadicalPairs = [
  ["\u{5f50}", "\u{2e95}"],
  ["\u{72ad}", "\u{2ea8}"],
  ["\u{961d}", "\u{2ed6}"],
  // from variation to original
  ["\u{201a2}", "\u{4eba}"],
];
for (const [cjkBlock, radBlock] of rogueCJKRadicalPairs) {
  const components = kanjiComponentMap.get(cjkBlock);
  if (components) {
    components.add(radBlock);
    components.delete(cjkBlock);
  }

  const strokeCount = kanjiStrokeCounts.get(cjkBlock);
  if (strokeCount && !kanjiStrokeCounts.has(radBlock)) {
    kanjiStrokeCounts.set(radBlock, strokeCount);
  }

  if (radicalMap.has(radBlock)) {
    radicalMap.delete(cjkBlock);
  }

  for (const original of componentVariationOf.get(cjkBlock) ?? []) {
    componentVariations.get(original)?.delete(cjkBlock);
  }

  componentVariationOf.delete(cjkBlock);
}

let componentKanjiMap = new Map();
for (const [kanji, components] of kanjiComponentMap) {
  for (const component of components) {
    let kanjiSet = componentKanjiMap.get(component);

    if (!kanjiSet) {
      kanjiSet = new Set();
      componentKanjiMap.set(component, kanjiSet);
    }

    kanjiSet.add(kanji);
  }
}

async function countStrokes(literal) {
  const kanjiStrokeCount = kanjiStrokeCounts.get(literal);
  if (kanjiStrokeCount) {
    return kanjiStrokeCount;
  }

  // The literal does not have a kanjivg entry.

  // Get a kanji which does include it.
  const [kanji] = componentKanjiMap.get(literal) ?? [];

  if (!kanji) {
    return null;
  }

  const hex = kanji.codePointAt(0).toString(16).padStart(5, "0");
  const pathURL = new URL(`${hex}.svg`, kanjivgDirURL);
  const xml = (await fs.readFile(pathURL, "utf-8")).replace(
    // Fix missing namespace
    `xmlns="http://www.w3.org/2000/svg"`,
    `xmlns="http://www.w3.org/2000/svg" xmlns:kvg="https://kanjivg.tagaini.net/svg-format.html"`,
  );
  const dom = domParser.parseFromString(xml, "text/xml");

  let count = 0;
  for (const g of dom.getElementsByTagName("g")) {
    if (
      g.getAttribute("kvg:element") === literal
        && (!g.hasAttribute("number") || Number.parseInt(g.getAttribute("number")) === 1)
    ) {
      count += g.getElementsByTagName("path").length;
    }
  }

  kanjiStrokeCounts.set(literal, count);

  return count;
}

for (const [literal, info] of radicalMap) {
  const strokeCount = await countStrokes(literal);
  const extra = radicalInfo.get(info.original) ?? radicalInfo.get(literal);

  Object.assign(info, { strokeCount, ...extra });
}

// All strokesCounts should be in the Map now.

function strokeCountSort(a, b) {
  return (kanjiStrokeCounts.get(a) ?? Number.POSITIVE_INFINITY) - (kanjiStrokeCounts.get(b) ?? Number.POSITIVE_INFINITY)
}

await fs.mkdir(new URL("../public/data/components-v1", import.meta.url), {
  recursive: true,
});

for (const [literal, kanji] of componentKanjiMap) {
  const hex = literal.codePointAt(0).toString(16).padStart(5, "0");
  const path = new URL(`../public/data/components-v1/${hex}.json`, import.meta.url);
  const radical = radicalMap.get(literal);
  const variations = componentVariations.get(literal);
  const variationOf = componentVariationOf.get(literal);
  const kanjiByStrokeCount = pipe(kanji, groupBy((literal) => kanjiStrokeCounts.get(literal)));
  const foundKanji = selectKanji.get(literal);

  await fs.writeFile(
    path,
    JSON.stringify({
      literal,
      radical,
      meaning: foundKanji?.meaning,
      reading: foundKanji?.kun_yomi ?? foundKanji?.on_yomi,
      strokeCount: await countStrokes(literal) ?? undefined,
      variations: variations ? [...variations].sort(strokeCountSort) : undefined,
      variationOf: variationOf ? [...variationOf].sort(strokeCountSort) : undefined,
      kanji: Object.fromEntries([...kanjiByStrokeCount].sort(([a], [b]) => a - b)),
    }),
  );
}

function radicalSort([a, aInfo], [b, bInfo]) {
  const strokeDiff = aInfo.strokeCount - bInfo.strokeCount;
  if (strokeDiff !== 0) {
    return strokeDiff;
  }

  const numberDiff = aInfo.number - bInfo.number;
  if (numberDiff !== 0) {
    return numberDiff;
  }

  if (aInfo.original === a) {
    return -1;
  }

  if (bInfo.original === b) {
    return 1;
  }
}

{
  const fileURL = new URL(`../public/data/index/radicals-kanji-v1.usv`, import.meta.url);
  const file = await fs.open(fileURL, "w");
  const fileStream = file.createWriteStream();

  for (const [literal, info] of [...radicalMap].sort(radicalSort)) {
    let kanjiLiterals = "";
    for (const kanji of componentKanjiMap.get(literal)) {
      kanjiLiterals += kanji;
    }
    fileStream.write(`${literal}␟${info.strokeCount}␟${kanjiLiterals}␟␞\n`);
  }
}

{
  const fileURL = new URL(`../public/data/index/kanji-radicals-v1.usv`, import.meta.url);
  const file = await fs.open(fileURL, "w");
  const fileStream = file.createWriteStream();

  for (
    const [strokeCount, entries] of pipe(
      kanjiComponentMap,
      groupBy(([literal]) => kanjiStrokeCounts.get(literal)),
      toArray(),
      (array) => array.sort(([a], [b]) => a - b),
    )
  ) {
    for (const [literal, components] of entries) {
      const radicals = [];
      for (const component of components) {
        const info = radicalMap.get(component);
        if (info) {
          radicals.push([component, info]);
        }
      }

      const radicalLiterals = radicals.sort(radicalSort).map(([literal]) => literal).join("");
      fileStream.write(`${literal}␟${strokeCount}␟${radicalLiterals}␟␞\n`);
    }
  }
}
