import {
  computed,
  ComputedRef,
  MaybeRefOrGetter,
  reactive,
  toValue,
  watch,
} from "vue";

import { KanaInfo } from "../types.ts";

const cache = reactive(new Map<string, KanaInfo>());

export function useKanaInfo(
  kana: MaybeRefOrGetter<string | null | undefined>,
): ComputedRef<KanaInfo | null> {
  watch(
    () => toValue(kana),
    async (value) => {
      if (!value || cache.has(value)) {
        return;
      }

      const hex = [...value]
        .map((char) => char.codePointAt(0)?.toString(16).padStart(5, "0"))
        .join("+");

      const response = await fetch(`/data/kana-v1/${hex}.json`);
      const data = await response.json();

      cache.set(value, data);
    },
    { immediate: true },
  );

  return computed(() => {
    const value = toValue(kana);
    if (!value) {
      return null;
    }

    return cache.get(value) ?? null;
  });
}

export const HIRAGANA_TABLE_DATA = {
  headings: ["", "a", "i", "u", "e", "o"],
  rows: [
    { heading: "-", cells: ["あ", "い", "う", "え", "お"] },
    { heading: "k-", cells: ["か", "き", "く", "け", "こ"] },
    { heading: "s-", cells: ["さ", "し", "す", "せ", "そ"] },
    { heading: "t-", cells: ["た", "ち", "つ", "て", "と"] },
    { heading: "n-", cells: ["な", "に", "ぬ", "ね", "の"] },
    { heading: "h-", cells: ["は", "ひ", "ふ", "へ", "ほ"] },
    { heading: "m-", cells: ["ま", "み", "む", "め", "も"] },
    { heading: "y-", cells: ["や", "", "ゆ", "", "よ"] },
    { heading: "r-", cells: ["ら", "り", "る", "れ", "ろ"] },
    { heading: "w-", cells: ["わ", "", "", "", "を"] },
    { heading: "n", cells: ["ん", "", "", "", ""] },
  ],
};

export const HIRAGANA_DAKUTEN_TABLE_DATA = {
  headings: ["", "a", "i", "u", "e", "o"],
  rows: [
    { heading: "g-", cells: ["が", "ぎ", "ぐ", "げ", "ご"] },
    { heading: "z-", cells: ["ざ", "じ", "ず", "ぜ", "ぞ"] },
    { heading: "d-", cells: ["だ", "ぢ", "づ", "で", "ど"] },
    { heading: "b-", cells: ["ぱ", "び", "ぶ", "べ", "ぼ"] },
    { heading: "p-", cells: ["ぱ", "ぴ", "ぷ", "ぺ", "ぽ"] },
  ],
};

export const HIRAGANA_YOON_TABLE_DATA = {
  headings: ["", "a", "u", "o"],
  rows: [
    { heading: "ky-", cells: ["きゃ", "きゅ", "きょ"] },
    { heading: "gy-", cells: ["ぎゃ", "ぎゅ", "ぎょ"] },
    { heading: "sh-", cells: ["しゃ", "しゅ", "しょ"] },
    { heading: "j-", cells: ["じゃ", "じゅ", "じょ"] },
    { heading: "ch-", cells: ["ちゃ", "ちゅ", "ちょ"] },
    { heading: "(d)j-", cells: ["ぢゃ", "ぢゅ", "ぢょ"] },
    { heading: "ny-", cells: ["にゃ", "にゅ", "にょ"] },
    { heading: "hy-", cells: ["ひゃ", "ひゅ", "ひょ"] },
    { heading: "by-", cells: ["びゃ", "びゅ", "びょ"] },
    { heading: "py-", cells: ["ぴゃ", "ぴゅ", "ぴょ"] },
    { heading: "my-", cells: ["みゃ", "みゅ", "みょ"] },
    { heading: "ry-", cells: ["りゃ", "りゅ", "りょ"] },
  ],
};

export const KATAKANA_TABLE_DATA = {
  headings: ["", "a", "i", "u", "e", "o"],
  rows: [
    { heading: "-", cells: ["ア", "イ", "ウ", "エ", "オ"] },
    { heading: "k-", cells: ["カ", "キ", "ク", "ケ", "コ"] },
    { heading: "s-", cells: ["サ", "シ", "ス", "セ", "ソ"] },
    { heading: "t-", cells: ["タ", "チ", "ツ", "テ", "ト"] },
    { heading: "n-", cells: ["ナ", "ニ", "ヌ", "ネ", "ノ"] },
    { heading: "h-", cells: ["ハ", "ヒ", "フ", "ヘ", "ホ"] },
    { heading: "m-", cells: ["マ", "ミ", "ム", "メ", "モ"] },
    { heading: "y-", cells: ["ヤ", "", "ユ", "", "ヨ"] },
    { heading: "r-", cells: ["ラ", "リ", "ル", "レ", "ロ"] },
    { heading: "w-", cells: ["ワ", "", "", "", "ヲ"] },
    { heading: "n", cells: ["ン", "", "", "", ""] },
  ],
};

export const KATAKANA_DAKUTEN_TABLE_DATA = {
  headings: ["", "a", "i", "u", "e", "o"],
  rows: [
    { heading: "g-", cells: ["ガ", "ギ", "グ", "ゲ", "ゴ"] },
    { heading: "z-", cells: ["ザ", "ジ", "ズ", "ゼ", "ゾ"] },
    { heading: "d-", cells: ["ダ", "", "", "デ", "ド"] },
    { heading: "b-", cells: ["バ", "ビ", "ブ", "ベ", "パ"] },
    { heading: "p-", cells: ["ボ", "ピ", "プ", "ペ", "ポ"] },
    { heading: "v-", cells: ["", "", "ヴ", "", ""] },
  ],
};

export const KATAKANA_YOON_TABLE_DATA = {
  headings: ["", "a", "i", "u", "e", "o"],
  rows: [
    { heading: "ky-", cells: ["キャ", "", "キュ", "", "キョ"] },
    { heading: "gy-", cells: ["ギャ", "", "ギュ", "", "ギョ"] },
    { heading: "sh-", cells: ["シャ", "", "シュ", "シェ", "ショ"] },
    { heading: "j-", cells: ["ジャ", "", "ジュ", "ジェ", "ジョ"] },
    { heading: "ch-", cells: ["チャ", "", "チュ", "チェ", "チョ"] },
    { heading: "t-", cells: ["", "ティ", "", "", ""] },
    { heading: "d-", cells: ["", "ディ", "", "", ""] },
    { heading: "dy-", cells: ["", "", "デュ", "", ""] },
    { heading: "ts-", cells: ["ツァ", "ツィ", "", "ツェ", "ツォ"] },
    { heading: "ny-", cells: ["ニャ", "", "ニュ", "", "ニョ"] },
    { heading: "f-", cells: ["ファ", "フィ", "", "フェ", ""] },
    { heading: "fy-", cells: ["", "", "フュ", "", ""] },
    { heading: "hy-", cells: ["ヒャ", "", "ヒュ", "", "ヒョ"] },
    { heading: "by-", cells: ["ビャ", "", "ビュ", "", "ビョ"] },
    { heading: "py-", cells: ["ピャ", "", "ピュ", "", "ピョ"] },
    { heading: "my-", cells: ["ミャ", "", "ミュ", "", "ミョ"] },
    { heading: "ry-", cells: ["リャ", "", "リュ", "", "リョ"] },
    { heading: "w-", cells: ["", "ウィ", "", "ウェ", "ウォ"] },
    { heading: "v-", cells: ["ヴァ", "ヴィ", "", "ヴェ", "ヴォ"] },
  ],
};

function extractLiterals(table: {
  rows: Array<{ cells: Array<string> }>;
}): string[] {
  return table.rows.flatMap(({ cells }) => cells).filter((cell) => cell);
}

export const KANA_TABLE_ROW_DATA: Array<{ label: string; literals: string[] }> =
  [
    {
      label: "Hiragana",
      literals: extractLiterals(HIRAGANA_TABLE_DATA),
    },
    {
      label: "Katakana",
      literals: extractLiterals(KATAKANA_TABLE_DATA),
    },
    {
      label: "Hiragana Dakuten",
      literals: extractLiterals(HIRAGANA_DAKUTEN_TABLE_DATA),
    },
    {
      label: "Katakana Dakuten",
      literals: extractLiterals(KATAKANA_DAKUTEN_TABLE_DATA),
    },
    {
      label: "Hiragana Yōon",
      literals: extractLiterals(HIRAGANA_YOON_TABLE_DATA),
    },
    {
      label: "Katakana Yōon",
      literals: extractLiterals(KATAKANA_YOON_TABLE_DATA),
    },
  ];

export function randomYoon(char: string): string {
  let samples: string[] | undefined;

  if (char === "ゃ" || char === "ゅ" || char === "ょ") {
    const useDakuten = Math.random() < 0.2;
    samples = useDakuten
      ? ["き", "し", "ち", "に", "ひ", "み", "り"]
      : ["ぎ", "じ", "び", "ぴ"];
  } else if (char === "ャ" || char === "ュ" || char === "ョ") {
    const useDakuten = Math.random() < 0.2;
    samples = useDakuten
      ? ["キ", "シ", "チ", "ニ", "ヒ", "ミ", "リ"]
      : ["ギ", "ジ", "ビ", "ピ"];

    if (char === "ュ" && useDakuten) {
      samples.push("デ", "フ");
    }
  } else if (char === "ァ") {
    samples = ["ツ", "フ", "ヴ"];
  } else if (char === "ィ") {
    samples = ["ツ", "テ", "デ", "フ", "ウ", "ヴ"];
  } else if (char === "ェ") {
    samples = ["シ", "ジ", "チ", "ツ", "フ", "ウ", "ヴ"];
  } else if (char === "ォ") {
    samples = ["シ", "フ", "ウ", "ヴ"];
  }

  if (!samples) {
    return char;
  }

  const picked = samples[Math.floor(samples.length * Math.random())];

  return `${picked}${char}`;
}

export function isYoon(char: string): boolean {
  return ["ゃ", "ゅ", "ょ", "ャ", "ュ", "ョ", "ァ", "ィ", "ェ", "ォ"].includes(
    char,
  );
}
