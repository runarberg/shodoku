const hasKanjiRE = /\p{Script=Han}/u;

export function parseSentenceIndexLine(line) {
  const iter = line[Symbol.iterator]();
  let next = iter.next();

  let idStr = "";
  while (!next.done && next.value !== "\t") {
    idStr += next.value;
    next = iter.next();
  }

  const sentenceId = Number.parseInt(idStr);

  // Ignore tab
  next = iter.next();

  let meaningIdStr = "";
  while (!next.done && next.value !== "\t") {
    meaningIdStr += next.value;
    next = iter.next();
  }

  const meaningId = Number.parseInt(meaningIdStr);

  // Ignore tab
  next = iter.next();

  const words = [];

  while (!next.done) {
    let writing = "";
    while (!next.done && !/[ ([{~]/.test(next.value)) {
      writing += next.value;
      next = iter.next();
    }

    let reading = null;
    if (next.value === "(") {
      reading = "";
      next = iter.next();

      while (!next.done && next.value !== ")") {
        reading += next.value;
        next = iter.next();
      }

      next = iter.next();
    }

    let meaning = null;
    if (next.value === "[") {
      let meaningStr = "";
      next = iter.next();

      while (!next.done && next.value !== "]") {
        meaningStr += next.value;
        next = iter.next();
      }

      meaning = Number.parseInt(meaningStr);
      next = iter.next();
    }

    let text = null;
    if (next.value === "{") {
      text = "";
      next = iter.next();

      while (!next.done && next.value !== "}") {
        text += next.value;
        next = iter.next();
      }

      next = iter.next();
    }

    let goodExample = 0;
    if (next.value === "~") {
      goodExample = 1;
      iter.next();
    }

    let word = null;
    if (reading?.startsWith("#")) {
      word = Number.parseInt(reading.slice(1));
      reading = null;
    }

    if (!reading && !hasKanjiRE.test(writing)) {
      reading = writing;
      writing = null;
    }

    words.push({ word, writing, reading, meaning, text, goodExample });
    next = iter.next();
  }

  return { sentenceId, meaningId, words };
}
