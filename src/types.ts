import { type Card as FSRSCard, ReviewLog, State } from "ts-fsrs";

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
};

export type WordReading = {
  text: string;
  priority?: { freq?: number };
};

export type WordMeaning = {
  pos?: string[];
  info?: string;
  glossary?: string[];
  useWithWriting?: string[];
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

export type SentenceWord = {
  word: number;
  furigana: Furigana;
};

export type Sentence = {
  sentence: string;
  meaning: string;
  words: SentenceWord[];
};

export type KanjiVocabWord = {
  word: number;
  sentences?: number[];
};

export type KanjiVocab = {
  codepoint: number;
  literal: string;
  words: KanjiVocabWord[];
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
};

export type CardType = "kanji-read" | "kanji-write";

export type Card = {
  id: number;
  value: string;
  decks: string[];
  types: CardType[];
  position: { priority: number; order: number };
  deckPositions: Array<{ deck: string; priority: number; order: number }>;
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
