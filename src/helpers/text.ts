export const hasKanjiRE = /\p{Script=Han}/u;
export const isKanjiRE = /^\p{Script=Han}$/u;
export const kanaOrKanjiRE =
  /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}\u{2e80}-\u{2fd5}\u{3000}-\u{303f}\u{31f0}-\u{31ff}\u{3220}-\u{3243}\u{3280}-\u{337f}\u{ff5f}-\u{ff9f}\u{ff01}-\u{ff5e}]/u;

export function hasKanaOrKanji(text: string): boolean {
  return kanaOrKanjiRE.test(text);
}

export function hasKanji(text: string): boolean {
  return hasKanjiRE.test(text);
}

export function isKanji(char: string): boolean {
  return isKanjiRE.test(char);
}

export const allHiraganaRE = /\p{Script=Hiragana}/gu;
export function toKatakana(str: string): string {
  return str.replaceAll(allHiraganaRE, (char) =>
    String.fromCodePoint((char.codePointAt(0) ?? 0) + 0x60)
  );
}
