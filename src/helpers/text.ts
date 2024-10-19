export const hasKanjiRE = /\p{Script=Han}/u;
export const isKanjiRE = /^\p{Script=Han}$/u;

export function isKanji(char: string): boolean {
  return isKanjiRE.test(char);
}
