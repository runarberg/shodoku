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
  text: string;
  word: number;
  furigana?: Furigana | null;
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
