import { hasKanaOrKanji, hasKanji } from "../helpers/text.ts";

const LIMIT = 100;

const UNIT_SEP = "\u{241f}";
const RECORD_SEP = "\u{241e}";
const GROUP_SEP = "\u{241d}";

const fetchingIndex = fetch("/data/index/words-v1.usv").then((response) =>
  response.text(),
);

function isInParams(heystack: string, needle: string): boolean {
  // FIXME: False positive in "(haystack) needle"
  const openParam = heystack.indexOf("(");

  if (openParam === -1) {
    return false;
  }

  return heystack.indexOf(needle) > openParam;
}

export type WordSearchResult = {
  id: number;
  phrase: string;
  match: string;
  matchShort: string;
  writings: string[];
  readings: string[];
  glossary: string[];
};

async function findWords(search: {
  phrase: string;
  writing: string | null;
  reading: string | null;
  glossary: string | null;
}): Promise<void> {
  const index = await fetchingIndex;

  let foundCount = 0;

  let i = 0;
  let record = 0;
  let unitStart = 0;
  let groupStart = 0;
  let matchContent = null;

  for (const char of index) {
    const len = char.length;

    if (char === UNIT_SEP) {
      if (!matchContent) {
        let unitContent;
        let haystack;
        let needle;

        if (search.reading && record === 1) {
          unitContent = index.slice(unitStart, i);
          haystack = unitContent;
          needle = search.reading;
        } else if (search.writing && record === 2) {
          unitContent = index.slice(unitStart, i);
          haystack = unitContent;
          needle = search.writing;
        } else if (search.glossary && record === 3) {
          unitContent = index.slice(unitStart, i);
          haystack = unitContent.toLowerCase();
          needle = search.glossary;
        }

        if (
          needle &&
          unitContent &&
          haystack?.includes(needle) &&
          !(search.glossary && isInParams(haystack, needle))
        ) {
          matchContent = unitContent;
        }
      }

      unitStart = i + len;
    } else if (char === RECORD_SEP) {
      record += 1;

      unitStart = i + len;
    } else if (char === GROUP_SEP) {
      if (matchContent) {
        const group = index.slice(groupStart, i).trim();
        const [idStr, readingRec, writingRec, glossaryRec] = group.split(
          `${UNIT_SEP}${RECORD_SEP}`,
        );
        const id = Number.parseInt(idStr);

        // Maybe remove parens for sorting etc.
        let matchShort = matchContent;
        if (search.glossary && matchShort.includes(" (")) {
          const matchIndex = matchShort.indexOf(search.phrase);
          const parenIndex = matchShort.indexOf(
            " (",
            matchIndex + search.phrase.length,
          );
          if (parenIndex !== -1) {
            matchShort = matchShort.slice(0, parenIndex);
          }
        }

        const result: WordSearchResult = {
          id,
          phrase: search.phrase,
          match: matchContent,
          matchShort,
          readings: readingRec.split(UNIT_SEP),
          writings: writingRec.split(UNIT_SEP),
          glossary: glossaryRec.split(UNIT_SEP),
        };

        self.postMessage(result);

        foundCount += 1;
        matchContent = null;

        if (foundCount === LIMIT) {
          break;
        }
      }

      record = 0;

      unitStart = i + len;
      groupStart = i + len;
    }

    i += len;
  }
}

addEventListener("message", async (event: MessageEvent<string>) => {
  const phrase = event.data.trim();

  const searchWriting = hasKanji(phrase);
  const searchReading = !searchWriting && hasKanaOrKanji(phrase);
  const searchGlossary = !searchWriting && !searchReading;

  findWords({
    phrase,
    writing: searchWriting ? phrase : null,
    reading: searchReading ? phrase : null,
    glossary: searchGlossary ? phrase.toLowerCase() : null,
  });
});
