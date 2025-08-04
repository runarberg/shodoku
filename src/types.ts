import { type Card as FSRSCard, ReviewLog } from "ts-fsrs";
import { StoreNames } from "idb";

import { DB } from "./db/schema.ts";

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
  phon: string | null;
};

export type KanjiComponentInfo = {
  literal: string;
  radical?: { original: string, number: number; en: string; jp: string };
  meaning?: string;
  reading?: string;
  strokeCount: number;
  variations?: string[];
  variationOf?: string[];
  kanji: Record<number, string[]>;
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
  types: CardType[];
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

export type SyncPatchStore = {
  name: StoreNames<DB>;
  add?: string[];
  put?: string[];
  delete?: string[];
};

type SyncPatchPreference = [name: string, value: string | null];

export type SyncPatch = {
  hash: string;
  parent: string | null;
  syncedAt: Date;
  dbVersion: number;
  patchVersion: number;
  stores: SyncPatchStore[];
  preferences: SyncPatchPreference[];
};

export type SyncStagingStore<
  StoreName extends StoreNames<DB> = StoreNames<DB>
> = {
  id?: number;
  store: StoreName;
  key: DB[StoreName]["key"];
  op: "add" | "put" | "delete";
};

export type SyncStagingPreference = {
  id?: number;
  name: string;
  value: string | null;
};
