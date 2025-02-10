import { openDB, DBSchema } from "idb";

import {
  BookmarkedWord,
  Card,
  CardProgress,
  CardReview,
  CardType,
  Deck,
} from "../types.ts";
import { State } from "ts-fsrs";

export interface DB extends DBSchema {
  decks: {
    key: string;
    value: Deck;
    indexes: {
      category: string;
      "category+priority": [string, number];
      cards: number[];
      createdAt: Date;
    };
  };

  cards: {
    key: number;
    value: Card;
    indexes: {
      decks: string[];
      position: [number, number];
      createdAt: Date;
    };
  };

  progress: {
    key: [number, CardType];
    value: CardProgress;
    indexes: {
      "cardId+cardType+state": [number, CardType, State];
      "state+due": [State, Date];
    };
  };

  reviews: {
    key: number;
    value: Omit<CardReview, "id">;
    indexes: {
      cardId: number;
      review: Date;
      "state+review": [State, Date];
    };
  };

  "review-limits": {
    key: number;
    value: {
      time: Date;
      count: {
        new: number;
        due: number;
      };
    };
    indexes: {
      time: Date;
    };
  };

  "bookmarked-words": {
    key: number;
    value: BookmarkedWord;
    indexes: {
      reading: string;
      bookmarkedAt: Date;
    };
  };
}

export const db = openDB<DB>("shodoku", 5, {
  async upgrade(db, oldVersion, _newVersion, tx) {
    if (oldVersion < 1) {
      const decks = db.createObjectStore("decks", { keyPath: "name" });
      decks.createIndex("category", "category");
      decks.createIndex("category+priority", ["category", "priority"]);
      decks.createIndex("cards", "cards", { multiEntry: true });

      const cards = db.createObjectStore("cards", { keyPath: "id" });
      cards.createIndex("decks", "decks", { multiEntry: true });
      cards.createIndex("position", ["position.priority", "position.order"]);

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
        const wordIds = await bookmarkedWords.getAllKeys();
        for (const wordId of wordIds) {
          bookmarkedWords.put({
            wordId,
            bookmarkedAt: new Date(),
          });
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
  },
});
