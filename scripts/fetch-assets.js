import fs from "node:fs";
import { Readable } from "node:stream";
import { finished } from "node:stream/promises";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

import tar from "tar-fs";
import bz2 from "unbzip2-stream";
import unzipStream from "unzip-stream";

const JMDICT_URL = "http://ftp.edrdg.org/pub/Nihongo/JMdict_e.gz";
const KANJIDIC2_URL = "http://www.edrdg.org/kanjidic/kanjidic2.xml.gz";
const KANJIVG_URL =
  "https://github.com/KanjiVG/kanjivg/releases/download/r20250422/kanjivg-20250422-main.zip";
const JMDICT_FURIGANA_URL =
  "https://github.com/Doublevil/JmdictFurigana/releases/download/2.3.1%2B2024-08-25/JmdictFurigana.json.zip";
const TATOEBA_ENG_URL =
  "https://downloads.tatoeba.org/exports/per_language/eng/eng_sentences.tsv.bz2";
const TATOEBA_JPN_URL =
  "https://downloads.tatoeba.org/exports/per_language/jpn/jpn_sentences.tsv.bz2";
const TATOEBA_JPN_INDICES_URL =
  "https://downloads.tatoeba.org/exports/jpn_indices.tar.bz2";

async function download(
  url,
  path,
  { unzip = false, bunzip2 = false, untar = false } = {},
) {
  const response = await fetch(url);
  let stream = Readable.fromWeb(response.body);

  if (unzip) {
    stream = stream.pipe(unzipStream.Extract({ path }));
  } else if (bunzip2) {
    stream = stream.pipe(bz2());

    if (untar) {
      stream = stream.pipe(tar.extract(path));
    } else {
      stream = stream.pipe(fs.createWriteStream(path));
    }
  } else {
    if (response.headers.get("Content-Type") === "application/x-gzip") {
      stream = stream.pipe(zlib.createGunzip());
    }

    stream = stream.pipe(fs.createWriteStream(path));
  }
  try {
    await finished(stream);
    // eslint-disable-next-line no-console
    console.log(`Downloaded: ${url} → ${path}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("failed");
    // eslint-disable-next-line no-console
    console.error(error);
  }
}

await Promise.all([
  download(
    JMDICT_URL,
    fileURLToPath(import.meta.resolve("../assets/JMdict_e.xml")),
  ),

  download(
    JMDICT_FURIGANA_URL,
    fileURLToPath(import.meta.resolve("../assets")),
    { unzip: true },
  ),

  download(
    KANJIDIC2_URL,
    fileURLToPath(import.meta.resolve("../assets/kanjidic2.xml")),
  ),

  download(
    KANJIVG_URL,
    fileURLToPath(import.meta.resolve("../public/kanjivg")),
    { unzip: true },
  ),

  download(
    TATOEBA_ENG_URL,
    fileURLToPath(import.meta.resolve("../assets/eng_sentences.tsv")),
    { bunzip2: true },
  ),

  download(
    TATOEBA_JPN_URL,
    fileURLToPath(import.meta.resolve("../assets/jpn_sentences.tsv")),
    { bunzip2: true },
  ),

  download(
    TATOEBA_JPN_INDICES_URL,
    fileURLToPath(import.meta.resolve("../assets")),
    { bunzip2: true, untar: true },
  ),
]);
