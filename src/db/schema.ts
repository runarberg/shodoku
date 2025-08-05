import { DBSchema } from "idb";
import { State } from "ts-fsrs";

import {
  BookmarkedWord,
  Card,
  CardProgress,
  CardReview,
  CardType,
  Deck,
  SyncPatch,
  SyncStagingPreference,
  SyncStagingStore,
} from "../types.ts";

export interface DB extends DBSchema {
  decks: {
    key: string;
    value: Deck;
    indexes: {
      category: string;
      "category+priority": [string, number];
      priority: number;
      cards: number[];
      createdAt: Date;
    };
  };

  cards: {
    key: number;
    value: Card;
    indexes: {
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

  syncs: {
    key: string;
    value: SyncPatch;
    indexes: {
      syncedAt: Date;
    };
  };

  "sync.staging.stores": {
    key: number;
    value: SyncStagingStore;
  };

  "sync.staging.preferences": {
    key: number;
    value: SyncStagingPreference;
  };
}
