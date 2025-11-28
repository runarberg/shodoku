import { Deck } from "../types.ts";

export function deckLabel(deck: Deck): string {
  if (deck.category === "genki") {
    return `Genki ${deck.label}`;
  }

  if (deck.category === "basic-kanji") {
    return `Basic Kanji ${deck.label.replace("Chapter", "ch.")}`;
  }

  return deck.label;
}

export function categoryLabel(name: string): string {
  if (name === "jouyou") {
    return "Jōyō";
  }

  return name;
}

export const jlptDecks = [
  {
    name: "jlpt-n5",
    label: "JLPT N5",
    priority: 5,
    content: "/data/kanji-lists/jlpt-n5.csv",
  },
  {
    name: "jlpt-n4",
    label: "JLPT N4",
    priority: 20,
    content: "/data/kanji-lists/jlpt-n4.csv",
  },
  {
    name: "jlpt-n3",
    label: "JLPT N3",
    priority: 40,
    content: "/data/kanji-lists/jlpt-n3.csv",
  },
  {
    name: "jlpt-n2",
    label: "JLPT N2",
    priority: 60,
    content: "/data/kanji-lists/jlpt-n2.csv",
  },
  {
    name: "jlpt-n1",
    label: "JLPT N1",
    priority: 100,
    content: "/data/kanji-lists/jlpt-n1.csv",
  },
];

export const newsFrequencyDecks = [
  {
    name: "news-top-50",
    label: "Top 50",
    priority: 3,
    content: "/data/kanji-lists/news-top-50.csv",
  },
  {
    name: "news-top-100",
    label: "Top 100",
    priority: 13,
    content: "/data/kanji-lists/news-top-100.csv",
  },
  {
    name: "news-top-200",
    label: "Top 200",
    priority: 25,
    content: "/data/kanji-lists/news-top-200.csv",
  },
  {
    name: "news-top-500",
    label: "Top 500",
    priority: 50,
    content: "/data/kanji-lists/news-top-500.csv",
  },
  {
    name: "news-top-1000",
    label: "Top 1000",
    priority: 80,
    content: "/data/kanji-lists/news-top-1000.csv",
  },
  {
    name: "news-top-2500",
    label: "Top 2501",
    priority: 100,
    content: "/data/kanji-lists/news-top-2500.csv",
  },
];

export const genkiDecks = Array.from({ length: 21 }, (_, i) => ({
  name: `genki-${(i + 3).toString().padStart(2, "0")}`,
  label: `Leasson ${i + 3}`,
  priority: i + 1,
  content: `/data/kanji-lists/genki-${(i + 3).toString().padStart(2, "0")}.csv`,
}));

export const basicKanjiDecks = Array.from({ length: 45 }, (_, i) => ({
  name: `basic-kanji-${(i + 1).toString().padStart(2, "0")}`,
  label: `Chapter ${i + 1}`,
  priority: i + 1,
  content: `/data/kanji-lists/basic-kanji-${(i + 1)
    .toString()
    .padStart(2, "0")}.csv`,
}));

export const jouyouDecks = [
  {
    name: "jouyou-grade-01",
    label: "Grade 1",
    priority: 5,
    content: "/data/kanji-lists/jouyou-grade-01.csv",
  },
  {
    name: "jouyou-grade-02",
    label: "Grade 2",
    priority: 15,
    content: "/data/kanji-lists/jouyou-grade-02.csv",
  },
  {
    name: "jouyou-grade-03",
    label: "Grade 3",
    priority: 25,
    content: "/data/kanji-lists/jouyou-grade-03.csv",
  },
  {
    name: "jouyou-grade-04",
    label: "Grade 4",
    priority: 35,
    content: "/data/kanji-lists/jouyou-grade-04.csv",
  },
  {
    name: "jouyou-grade-05",
    label: "Grade 5",
    priority: 45,
    content: "/data/kanji-lists/jouyou-grade-05.csv",
  },
  {
    name: "jouyou-grade-06",
    label: "Grade 6",
    priority: 55,
    content: "/data/kanji-lists/jouyou-grade-06.csv",
  },
  {
    name: "jouyou-grade-s",
    label: "Grade 7-9",
    priority: 100,
    content: "/data/kanji-lists/jouyou-grade-s.csv",
  },
];

export type KanaDeckTemplate = {
  name: string;
  label: string;
  priority: number;
  category: "kana";
  cards: number[];
  cardTypes: ["kana-write", "kana-read"];
};

const hiraganaDeckTemplate: KanaDeckTemplate = {
  name: "hiragana",
  label: "Hiragana",
  priority: -9,
  category: "kana",
  cards: [
    0x3042, 0x3044, 0x3046, 0x3048, 0x304a, 0x304b, 0x304d, 0x304f, 0x3051,
    0x3053, 0x3055, 0x3057, 0x3059, 0x305b, 0x305d, 0x305f, 0x3061, 0x3064,
    0x3066, 0x3068, 0x306a, 0x306b, 0x306c, 0x306d, 0x306e, 0x306f, 0x3072,
    0x3075, 0x3078, 0x307b, 0x307e, 0x307f, 0x3080, 0x3081, 0x3082, 0x3084,
    0x3086, 0x3088, 0x3089, 0x308a, 0x308b, 0x308c, 0x308d, 0x308f, 0x3092,
    0x3093,
  ],
  cardTypes: ["kana-write", "kana-read"],
};

const katakanaDeckTemplate: KanaDeckTemplate = {
  name: "katakana",
  label: "Katakana",
  priority: -8,
  category: "kana",
  cards: [
    0x30a2, 0x30a4, 0x30a6, 0x30a8, 0x30aa, 0x30ab, 0x30ad, 0x30af, 0x30b1,
    0x30b3, 0x30b5, 0x30b7, 0x30b9, 0x30bb, 0x30bd, 0x30bf, 0x30c1, 0x30c4,
    0x30c6, 0x30c8, 0x30ca, 0x30cb, 0x30cc, 0x30cd, 0x30ce, 0x30cf, 0x30d2,
    0x30d5, 0x30d8, 0x30db, 0x30de, 0x30df, 0x30e0, 0x30e1, 0x30e2, 0x30e4,
    0x30e6, 0x30e8, 0x30e9, 0x30ea, 0x30eb, 0x30ec, 0x30ed, 0x30ef, 0x30f2,
    0x30f3,
  ],
  cardTypes: ["kana-write", "kana-read"],
};

const hiraganaDakutenDeckTemplate: KanaDeckTemplate = {
  name: "hiragana-dakuten",
  label: "Hiragana Dakuten",
  priority: -7,
  category: "kana",
  cards: [
    0x304c, 0x304e, 0x3050, 0x3052, 0x3054, 0x3056, 0x3058, 0x305a, 0x305c,
    0x305e, 0x3060, 0x3062, 0x3065, 0x3067, 0x3069, 0x3070, 0x3071, 0x3073,
    0x3074, 0x3076, 0x3077, 0x3079, 0x307a, 0x307c, 0x307d,
  ],
  cardTypes: ["kana-write", "kana-read"],
};

const hiraganaYoonDeckTemplate: KanaDeckTemplate = {
  name: "hiragana-yoon",
  label: "Hiragana Yōon",
  priority: -6,
  category: "kana",
  cards: [0x3083, 0x3085, 0x3087],
  cardTypes: ["kana-write", "kana-read"],
};

const katakanaDakutenDeckTemplate: KanaDeckTemplate = {
  name: "katakana-dakuten",
  label: "Katakana Dakuten",
  priority: -5,
  category: "kana",
  cards: [
    // Note: Skipping ヂ and ヅ but adding ヴ.
    0x30ac, 0x30ae, 0x30b0, 0x30b2, 0x30b4, 0x30b6, 0x30b8, 0x30ba, 0x30bc,
    0x30be, 0x30c0, 0x30c7, 0x30c9, 0x30d0, 0x30d1, 0x30d3, 0x30d4, 0x30d6,
    0x30d7, 0x30d9, 0x30da, 0x30dc, 0x30dd, 0x30f4,
  ],
  cardTypes: ["kana-write", "kana-read"],
};

const katakanaYoonDeckTemplate: KanaDeckTemplate = {
  name: "katakana-yoon",
  label: "Katakana Yōon",
  priority: -4,
  category: "kana",
  cards: [0x30e3, 0x30e5, 0x30e7, 0x30a1, 0x30a3, 0x30a7, 0x30a9],
  cardTypes: ["kana-write", "kana-read"],
};

// TODO: kana sukuon

export const kanaDeckTemplates = {
  hiragana: hiraganaDeckTemplate,
  katakana: katakanaDeckTemplate,
  hiraganaDakuten: hiraganaDakutenDeckTemplate,
  hiraganaYoon: hiraganaYoonDeckTemplate,
  katakanaDakuten: katakanaDakutenDeckTemplate,
  katakanaYoon: katakanaYoonDeckTemplate,
};
