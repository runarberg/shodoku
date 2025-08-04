import { pipe } from "yta";
import { enumerate, groupBy, toArray } from "yta/sync";

const UNIT_SEP = "\u{241f}";
const RECORD_SEP = "\u{241e}";

type AllRadicalsMessage = {
  type: "all-radicals";
  allRadicals: Map<number, string[]>;
};

type KanjiSelectionMessage = {
  type: "kanji-selection";
  kanjiSelection: Map<number, string[]>;
  filteredRadicals: Set<string>;
};

export type ComponentPickerMessage = AllRadicalsMessage | KanjiSelectionMessage;

const fetchingKanjiRadicals = fetch("/data/index/kanji-radicals-v1.usv").then((response) =>
  response.text(),
);

const fetchingRadicalsKanji = fetch("/data/index/radicals-kanji-v1.usv").then((response) =>
  response.text(),
);

function* readUSVRecords(source: string): Iterable<Iterable<string>> {
  const charIter = source[Symbol.iterator]();

  let pos = 0;
  let result = charIter.next();

  function* unitIter() {
    let unitStart = pos;

    if (result.value === "\n") {
      // Ignore record leading newline.
      pos += 1;
      unitStart = pos;
      result = charIter.next();
    }

    while (!result.done) {
      const char = result.value;

      if (char === RECORD_SEP) {
        pos += char.length;

        return;
      }

      if (char === UNIT_SEP) {
        yield source.slice(unitStart, pos);

        unitStart = pos + char.length;
      }

      pos += char.length;
      result = charIter.next();
    }
  }

  while (!result.done) {
    yield unitIter();

    result = charIter.next();
  }
}

async function createRadicalSelection() {
  const source = await fetchingRadicalsKanji;
  const radicalsMap = new Map<number, string[]>();

  for (const record of readUSVRecords(source)) {
    let literal = "";
    for (const [unitNumber, unit] of pipe(record, enumerate())) {
      if (unitNumber === 0) {
        literal = unit;
      } else if (unitNumber === 1) {
        const strokeCount = Number.parseInt(unit);
        let literals = radicalsMap.get(strokeCount);

        if (!literals) {
          literals = [];
          radicalsMap.set(strokeCount, literals);
        }

        literals.push(literal);
      }
    }
  }

  return radicalsMap;
}

async function findKanji(radicals: Set<string>): Promise<Set<string>> {
  let found: Set<string> | null = null;

  if (radicals.size === 0) {
    return new Set();
  }

  let foundCount = 0;
  let literal = null;

  recordLoop:
  for (const record of readUSVRecords(await fetchingRadicalsKanji)) {
    for (const [unitNumber, unit] of pipe(record, enumerate())) {
      switch (unitNumber) {
        case 0:
          if (radicals.has(unit)) {
            literal = unit;
            foundCount += 1;
          } else {
            literal = null;
          }

          break;

        case 2:
          if (literal) {
            if (found) {
              const intersection = new Set<string>();
              for (const literal of unit) {
                if (found.has(literal)) {
                  intersection.add(literal);
                }
              }
              found = intersection;
            } else {
              found = new Set();
              for (const literal of unit) {
                found.add(literal);
              }
            }

            if (foundCount === radicals.size) {
              break recordLoop;
            }
          }
      }
    }
  }

  return found ?? new Set();
}

async function getStrokesAndRadicals(kanji: Set<string>): Promise<[Map<string, number>, Set<string>]> {
  const strokeCounts = new Map<string, number>();
  const radicals = new Set<string>();

  let foundCount = 0;
  let literal = null;

  recordLoop:
  for (const record of readUSVRecords(await fetchingKanjiRadicals)) {
    for (const [unitNumber, unit] of pipe(record, enumerate())) {
      switch (unitNumber) {
        case 0:
          if (kanji.has(unit)) {
            literal = unit;
            foundCount += 1;
          } else {
            literal = null;
          }

          break;

        case 1:
          if (literal) {
            strokeCounts.set(literal, Number.parseInt(unit))
          }

          break;

        case 2:
          if (literal) {
            for (const literal of unit) {
              radicals.add(literal);
            }

            if (foundCount === kanji.size) {
              break recordLoop;
            }
          }
      }
    }
  }

  return [strokeCounts, radicals];
}

addEventListener("message", async (event: MessageEvent<"init" | Set<string>>) => {
  if (event.data === "init") {
    const allRadicals = await createRadicalSelection();
    const message: AllRadicalsMessage = {
      type: "all-radicals",
      allRadicals,
    };

    self.postMessage(message)

    return;
  }

  const foundKanji = await findKanji(event.data);
  const [kanjiStrokeCounts, filteredRadicals] = await getStrokesAndRadicals(foundKanji);

  const kanjiSelection = pipe(
    foundKanji,
    groupBy((literal) => kanjiStrokeCounts.get(literal) ?? NaN),
    toArray(),
    (array) => new Map(array.sort(([a], [b]) => a - b)),
  );

  const message: KanjiSelectionMessage = {
    type: "kanji-selection",
    kanjiSelection,
    filteredRadicals,
  };

  self.postMessage(message);
});
