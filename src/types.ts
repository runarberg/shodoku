import { type Card as FSRSCard, ReviewLog } from "ts-fsrs";

export type Optional<T, Keys extends keyof T> = Omit<T, Keys> &
  Partial<Pick<T, Keys>>;

export type KanjiInfo = {
  codepoint: number;
  literal: string;
  meanings: string[];
  kunYomi: string[];
  onYomi: string[];
  strokeCount: number;
  radical: number;
  freq?: number;
  grade?: string;
};

export type KanjiComponent = {
  element: string;
  original: string | null;
  position: string[];
  radical: string | null;
};

export type WordWriting = {
  text: string;
  priority?: { freq?: number };
  irregular?: boolean;
  rare?: boolean;
  outdated?: boolean;
  searchOnly?: boolean;
};

export type WordReading = {
  text: string;
  priority?: { freq?: number };
  irregular?: boolean;
  rare?: boolean;
  outdated?: boolean;
  searchOnly?: boolean;
};

export type WordMeaning = {
  pos?: string[];
  info?: string;
  glossary?: string[];
  useWithWriting?: string[];
  kanaPreferred?: boolean;
};

export type Furigana = Array<{
  ruby: string;
  rt?: string;
}>;

export type Word = {
  id: number;
  writings?: WordWriting[];
  readings?: WordReading[];
  meanings?: WordMeaning[];
  furigana?: Array<{
    writing: string;
    reading: string;
    furigana: Furigana;
  }>;
};

export type BookmarkedWord = {
  wordId: number;
  bookmarkedAt: Date;
  reading?: string | null;
};

export type SentenceWord = {
  word: number;
  furigana: Furigana;
};

export type Sentence = {
  sentence: string;
  meaning: string;
  words: SentenceWord[];
};

export type KanjiVocab = {
  codepoint: number;
  literal: string;
  words: number[];
};

export type Radical = {
  id: number;
  literal: string;
  strokes: number;
  meaning: string;
  reading: string;
};

// A description of a deck for deck browser.
export type DeckTemplate = {
  name: string;
  label: string;
  priority: number;
  content: string;
};

export type Deck = {
  name: string;
  label: string;
  category: string;
  priority: number;
  cards: number[];
  active: boolean;
  createdAt: Date;
  updatedAt?: Date;
};

export type CardType = "kanji-read" | "kanji-write";
export function isCardType(thing: string): thing is CardType {
  return thing === "kanji-read" || thing === "kanji-write";
}

export type Card = {
  id: number;
  value: string;
  decks: string[];
  types: CardType[];
  position: { priority: number; order: number };
  deckPositions: Array<{ deck: string; priority: number; order: number }>;
  createdAt: Date;
  updatedAt?: Date;
};

export type CardProgress = {
  cardId: number;
  cardType: CardType;
  fsrs: FSRSCard;
};

export type CardReview = {
  id: number;
  cardId: number;
  cardType: CardType;
  log: ReviewLog;
};
