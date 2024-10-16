import { Deck } from "../types.ts";

export function deckLabel(deck: Deck) {
  if (deck.category === "genki") {
    return `Genki ${deck.label}`;
  }

  return deck.label;
}
