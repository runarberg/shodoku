import Dexie, { type EntityTable } from "dexie";

import { Card, Deck, Review } from "../types.ts";

export const db = new Dexie("shodoku") as Dexie & {
  decks: EntityTable<Deck, "name">;
  cards: EntityTable<Card, "id">;
  reviews: EntityTable<Review, "id">;
};

db.version(1).stores({
  decks: "name, category, [category+priority]",
  cards: `
    id,
    value,
    *decks,
    [priority+order],
    fsrs.read.state,
    fsrs.read.due,
    fsrs.write.state,
    fsrs.write.due,
    [fsrs.read.state+fsrs.read.due],
    [fsrs.write.state+fsrs.write.due]
  `,
  reviews: "++id, cardId, type, log.review",
});
