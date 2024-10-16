import { openDB, DBSchema } from "idb";

import { Card, Deck, CardReview, CardProgress, CardType } from "../types.ts";
import { State } from "ts-fsrs";

export interface DB extends DBSchema {
  decks: {
    key: string;
    value: Deck;
    indexes: {
      category: string;
      "category+priority": [string, number];
      cards: number[];
    };
  };

  cards: {
    key: number;
    value: Card;
    indexes: {
      decks: string[];
      position: [number, number];
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
}

export const db = openDB<DB>("shodoku", 2, {
  upgrade(db, oldVersion) {
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
  },
});
