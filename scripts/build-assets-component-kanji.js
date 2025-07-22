import fs from "node:fs/promises";

import { DOMParser } from "@xmldom/xmldom";

function isKanji(codepoint) {
  return (
    (codepoint >= 0x4e00 && codepoint <= 0x9fc3)
      || (codepoint >= 0x3400 && codepoint <= 0x4dbf)
  );
}

const kanjivgDirURL = new URL("../public/kanjivg/kanji/", import.meta.url);
const domParser = new DOMParser();

const componentStrokeCounts = new Map();
const kanjiStrokeCounts = new Map();

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
    const component = g.getAttribute("kvg:element");

    if (component) {
      components.add(component);
    }

    if (!componentStrokeCounts.has(component)) {
      componentStrokeCounts.set(component, g.getElementsByTagName("path").length);
    }
  }

  if (!kanjiStrokeCounts.has(kanji)) {
    kanjiStrokeCounts.set(kanji, dom.getElementsByTagName("path").length);
  }

  kanjiComponentMap.set(kanji, components);
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

for (const [component, kanji] of componentKanjiMap) {
  const sorted = [...kanji].sort(
    (a, b) => kanjiStrokeCounts.get(a) - kanjiStrokeCounts.get(b),
  );

  componentKanjiMap.set(component, new Set(sorted));
}

const componentKanjiSorted = [...componentKanjiMap.entries()].sort(
  ([a], [b]) => componentStrokeCounts.get(a) - componentStrokeCounts.get(b),
)

const fileURL = new URL(`../public/data/index/components-to-kanji-v1.usv`, import.meta.url);
const file = await fs.open(fileURL, "w");
const fileStream = file.createWriteStream();

const UNIT_SEP = "\u{241f}";
const RECORD_SEP = "\u{241e}";
const GROUP_SEP = "\u{241d}";

for (const [component, kanji] of componentKanjiSorted) {
  let units = "";
  for (const char of kanji) {
    units += `${char}${UNIT_SEP}`;
  }

  const line = `${component}${UNIT_SEP}${RECORD_SEP}${units}${RECORD_SEP}${GROUP_SEP}\n`;
  fileStream.write(line);
}
