# Shodoku 書読

> Learn Kanji by writing and reading it

**Shodoku** is a kanji learning app with a focus on context and
clues. We focus on practicing both writing and reading each kanji
while making at easy for you to remember the kanji without revealing
it to you. We do that by providing a lot of words and sentences for
each kanji as well as component elements of the kanji, its radical,
meanings, readings, etc. The hope is that the additional context will
make it easier for you to burn it into your memory such that you will
be able to both recognize it, as well as start reading words with it
right away.

## Setup

This app is based onfree data. We collect to populate a database we
then use to build smaller data asset files. The hope is that the app
will remain relatively small to download and that users will only
download as much data as they need. Keeping the app both small and
fast.

### Build the data asset files

1. Download the data
   ```bash
   node scripts/fetch-assets.js
   ```
2. Populate the database
   ```bash
   node scripts/populate-db-kanji.js
   node scripts/populate-db-kanji-extra.js
   node scripts/populate-db-words.js
   node scripts/populate-db-words-furigana.js
   node scripts/populate-db-word-lists.js
   node scripts/populate-db-sentences.js ## This takes half an hour
   ```
3. Build the data assets
   ```bash
   node scripts/build-assets-kanji.js
   node scripts/build-assets-words.js
   node scripts/build-assets-sentences.js
   node scripts/build-assets-components.js
   node scripts/build-assets-kanji-vocab.js  ## This takes an hour
   node scripts/build-assets-words-sentences.js
   node scripts/build-assets-kanji-index.js
   node scripts/build-assets-word-index.js
   ```

### Run the dev server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```
