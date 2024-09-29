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
    let word = "";
    while (!next.done && !/[ ([{~]/.test(next.value)) {
      word += next.value;
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

    let sense = null;
    if (next.value === "[") {
      let senseStr = "";
      next = iter.next();

      while (!next.done && next.value !== "]") {
        senseStr += next.value;
        next = iter.next();
      }

      sense = Number.parseInt(senseStr);
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

    let goodExample = false;
    if (next.value === "~") {
      goodExample = true;
      iter.next();
    }

    let wordId = null;
    if (reading?.startsWith("#")) {
      wordId = Number.parseInt(reading.slice(1));
      reading = null;
    }

    words.push({ word, wordId, reading, text, sense, goodExample });
    next = iter.next();
  }

  return { sentenceId, meaningId, words };
}
