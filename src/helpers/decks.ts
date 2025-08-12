import { Deck } from "../types.ts";

export function deckLabel(deck: Deck) {
  if (deck.category === "genki") {
    return `Genki ${deck.label}`;
  }

  if (deck.category === "basic-kanji") {
    return `Basic Kanji ${deck.label.replace("Chapter", "ch.")}`;
  }

  return deck.label;
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
