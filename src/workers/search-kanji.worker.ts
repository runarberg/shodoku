import { hasKanaOrKanji, hasKanji, toKatakana } from "../helpers/text.ts";

const LIMIT = 6;

const UNIT_SEP = "\u{241f}";
const RECORD_SEP = "\u{241e}";
const GROUP_SEP = "\u{241d}";

const fetchingIndex = fetch("/data/index/kanji-v1.usv").then((response) =>
  response.text()
);

export type KanjiSearchResult = {
  id: number;
  match: string;
  kunYomi: string[];
  onYomi: string[];
  meanings: string[];
};

async function findWords(search: {
  en?: string;
  hiragana?: string;
  katakana?: string;
}): Promise<KanjiSearchResult[]> {
  const index = await fetchingIndex;

  const found: KanjiSearchResult[] = [];
  let i = 0;
  let unit = 0;
  let record = 0;
  let group = 0;
  let unitStart = 0;
  let groupStart = 0;
  let foundInGroup = null;

  for (const char of index) {
    const len = char.length;

    if (char === UNIT_SEP) {
      if (!foundInGroup) {
        let unitContent;
        let haystack;
        let needle;

        if (search.hiragana && record === 1) {
          unitContent = index.slice(unitStart + len, i);
          haystack = unitContent.replaceAll(".", "");
          needle = search.hiragana;
        } else if (search.katakana && record === 2) {
          unitContent = index.slice(unitStart + len, i);
          haystack = unitContent;
          needle = search.katakana;
        } else if (search.en && record === 3) {
          unitContent = index.slice(unitStart + len, i);
          haystack = unitContent.toLowerCase();
          needle = search.en;
        }

        if (needle && unitContent && haystack?.includes(needle)) {
          foundInGroup = unitContent;
        }
      }

      unit += 1;
      unitStart = i;
    } else if (char === RECORD_SEP) {
      unit = 0;
      record += 1;

      unitStart = i;
    } else if (char === GROUP_SEP) {
      if (foundInGroup) {
        const group = index.slice(groupStart + len, i).trim();
        const [literal, kunYomiRec, onYomiRec, meaningRec] = group.split(
          `${UNIT_SEP}${RECORD_SEP}`
        );
        const id = literal.codePointAt(0) ?? -1;

        found.push({
          id,
          match: foundInGroup,
          kunYomi: kunYomiRec.split(UNIT_SEP),
          onYomi: onYomiRec.split(UNIT_SEP),
          meanings: meaningRec.split(UNIT_SEP),
        });
        foundInGroup = null;

        if (found.length === LIMIT) {
          break;
        }
      }

      unit = 0;
      record = 0;
      group += 1;

      unitStart = i;
      groupStart = i;
    }

    i += len;
  }

  return found;
}

addEventListener("message", async (event: MessageEvent<string>) => {
  const { data: phrase } = event;

  if (hasKanji(phrase)) {
    return [];
  }

  let found;

  if (hasKanaOrKanji(phrase)) {
    found = await findWords({
      hiragana: phrase,
      katakana: toKatakana(phrase),
    });
  } else {
    found = await findWords({ en: phrase.toLowerCase() });
  }

  self.postMessage(found);
});
