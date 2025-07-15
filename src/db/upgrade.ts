import { IDBPDatabase, IDBPTransaction, StoreNames } from "idb";

import { DB } from "./schema.ts";
import { Card } from "../types";

export default async function upgrade(
  db: IDBPDatabase<DB>,
  oldVersion: number,
  _newVersion: number | null,
  tx: IDBPTransaction<DB, StoreNames<DB>[], "versionchange">,
  _event: IDBVersionChangeEvent
): Promise<void> {
  if (oldVersion < 1) {
    const decks = db.createObjectStore("decks", { keyPath: "name" });
    decks.createIndex("category", "category");
    decks.createIndex("category+priority", ["category", "priority"]);
    decks.createIndex("cards", "cards", { multiEntry: true });

    db.createObjectStore("cards", { keyPath: "id" });

    const progress = db.createObjectStore("progress", {
      keyPath: ["cardId", "cardType"],
    });
    progress.createIndex("cardId+cardType+state", [
      "cardId",
      "cardType",
      "fsrs.state",
    ]);
    progress.createIndex("state+due", ["fsrs.state", "fsrs.due"]);

    const reviews = db.createObjectStore("reviews", {
      keyPath: "id",
      autoIncrement: true,
    });
    reviews.createIndex("cardId", "cardId");
    reviews.createIndex("review", "log.review");
    reviews.createIndex("state+review", ["log.state", "log.review"]);
  }

  if (oldVersion < 2) {
    const reviewLimits = db.createObjectStore("review-limits", {
      keyPath: "id",
      autoIncrement: true,
    });

    reviewLimits.createIndex("time", "time");
  }

  if (oldVersion < 3) {
    db.createObjectStore("bookmarked-words", { keyPath: "wordId" });
  }

  if (oldVersion < 4) {
    const bookmarkedWords = tx.objectStore("bookmarked-words");

    bookmarkedWords.createIndex("reading", "reading");
    bookmarkedWords.createIndex("bookmarkedAt", "bookmarkedAt");

    if (oldVersion >= 3) {
      // Add missing data
      const bookmarkedAt = new Date();
      const wordIds = await bookmarkedWords.getAllKeys();

      for (const wordId of wordIds) {
        bookmarkedWords.put({ wordId, bookmarkedAt });
      }
    }
  }

  if (oldVersion < 5) {
    const decks = tx.objectStore("decks");
    decks.createIndex("createdAt", "createdAt");

    const cards = tx.objectStore("cards");
    cards.createIndex("createdAt", "createdAt");

    if (oldVersion >= 4) {
      const now = new Date();

      for await (const cursor of decks.iterate()) {
        const deck = cursor.value;
        deck.active = true;
        deck.createdAt = now;

        await cursor.update(deck);
      }

      for await (const cursor of cards.iterate()) {
        const card = cursor.value;
        card.createdAt = now;

        await cursor.update(card);
      }
    }
  }

  if (oldVersion < 6) {
    const syncs = db.createObjectStore("syncs", { keyPath: "hash" });
    syncs.createIndex("syncedAt", "syncedAt");

    db.createObjectStore("sync.staging.stores", {
      keyPath: "id",
      autoIncrement: true,
    });

    db.createObjectStore("sync.staging.preferences", {
      keyPath: "id",
      autoIncrement: true,
    });

    const decks = tx.objectStore("decks");
    decks.createIndex("priority", "priority");
  }

  if (oldVersion >= 1) {
    const cards = tx.objectStore("cards");

    if (cards.indexNames.contains("decks" as any)) {
      cards.deleteIndex("decks");
    }

    if (cards.indexNames.contains("position" as any)) {
      cards.deleteIndex("position");
    }

    for await (const cursor of cards.iterate()) {
      const card = cursor.value as Card & {
        position?: unknown;
        decks?: unknown;
        deckPositions?: unknown;
      };

      if ("position" in card) {
        delete card.position;
      }

      if ("decks" in card) {
        delete card.decks;
      }

      if ("deckPositions" in card) {
        delete card.deckPositions;
      }

      cursor.update(card);
    }
  }
}
