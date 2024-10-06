import Dexie, { type EntityTable } from "dexie";

import { Card, Deck } from "../types.ts";

export const db = new Dexie("shodoku") as Dexie & {
  decks: EntityTable<Deck, "name">;
  cards: EntityTable<Card, "id">;
};

db.version(1).stores({
  decks: "name, category, [category+priority]",
  cards: `
    id,
    value,
    *decks,
    [priority+order],
    fsrs.read.due,
    fsrs.read.state,
    fsrs.write.due,
    fsrs.write.state,
    [fsrs.write.due+fsrs.read.due],
    [fsrs.write.state+fsrs.read.state]
  `,
});
