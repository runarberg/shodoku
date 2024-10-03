export function annotateSentenceFurigana(text, words) {
  const annotated = [];
  let start = 0;

  for (const word of words) {
    const i = text.indexOf(word.text, start);

    if (i === -1) {
      // Word was wrongly indexed and is not in this sentence.
      // It will be picked up unannotated in the next round
      continue;
    }

    if (i > start) {
      // Missing word index, possibly a name.
      annotated.push({
        word: null,
        furigana: [{ ruby: text.slice(start, i) }],
      });
      start = i;
    }

    const furigana = [];
    if (word.furigana) {
      // Fix alternative forms, icl. kana, te-form, etc.
      let lastEnd = 0;

      for (const { ruby, rt } of word.furigana) {
        if (!rt) {
          continue;
        }

        const pos = word.text.indexOf(ruby, lastEnd);
        if (pos === -1) {
          continue;
        }

        // TODO: Make sure we skip this ruby if we matched it prematurely.

        if (pos > lastEnd) {
          furigana.push({ ruby: word.text.slice(lastEnd, pos) });
        }

        furigana.push({ ruby, rt });
        lastEnd = pos + ruby.length;
      }

      if (lastEnd < word.text.length) {
        furigana.push({ ruby: word.text.slice(lastEnd) });
      }
    } else {
      furigana.push({ ruby: word.text });
    }

    annotated.push({ word: word.word, furigana });
    start += word.text.length;
  }

  if (start < text.length) {
    // Grab the remainder at the end.
    annotated.push({ word: null, furigana: [{ ruby: text.slice(start) }] });
  }

  return annotated;
}
