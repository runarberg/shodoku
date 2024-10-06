import { createEmptyCard } from "ts-fsrs";

import { Card, Deck, DeckTemplate } from "../types.ts";

import { db } from "./index.ts";

function isNotNull<T>(thing: T | null | undefined): thing is T {
  return thing != null;
}

type DeckPosition = { deck: string; priority: number; order: number };

async function addCardToDeck(
  id: number,
  { deck, priority, order }: DeckPosition
): Promise<{ type: "create" | "put"; card: Card } | null> {
  const card = await db.cards.get(id);

  if (!card) {
    return {
      type: "create",
      card: {
        id,
        value: String.fromCodePoint(id),
        decks: [deck],
        priority,
        order,
        deckPositions: [{ deck, priority, order }],
        fsrs: {
          read: createEmptyCard(),
          write: createEmptyCard(),
        },
      },
    };
  }

  let modified = false;

  if (card.priority > priority) {
    card.priority = priority;
    card.order = order;
    modified = true;
  }

  if (!card.decks.includes(deck)) {
    card.decks.push(deck);
    card.deckPositions.push({ deck, priority, order });
    modified = true;
  }

  if (modified) {
    return {
      type: "put",
      card,
    };
  }

  return null;
}

export function browserAddDeck(deck: Deck, cardIds: number[]) {
  return db.transaction("rw", [db.cards, db.decks], async () => {
    await db.decks.add(deck);

    let order = 0;
    const updates = [];
    const creates = [];

    for (const id of cardIds) {
      order += 1;
      const added = await addCardToDeck(id, {
        deck: deck.name,
        priority: deck.priority,
        order,
      });

      if (added?.type === "create") {
        creates.push(added.card);
      } else if (added?.type === "put") {
        updates.push(added.card);
      }
    }

    await db.cards.bulkAdd(creates);
    await db.cards.bulkPut(updates);
  });
}

export async function browserAddCategory(
  category: string,
  deckTemplates: DeckTemplate[]
) {
  const storedDecks = await db.decks.where({ category }).primaryKeys();
  const decks = await Promise.all(
    deckTemplates
      .filter(({ name }) => !storedDecks.includes(name))
      .map(async ({ name, label, priority, content }) => {
        const response = await fetch(content);
        const csv = await response.text();

        const cardIds = csv
          .split("\n")
          .map((line) => line.codePointAt(0))
          .filter(isNotNull);

        return {
          name,
          label,
          priority,
          category,
          cardIds,
        };
      })
  );

  return db.transaction("rw", [db.cards, db.decks], async () => {
    for (const { cardIds, ...deck } of decks) {
      await db.decks.add(deck);

      let order = 0;
      const updates = [];
      const creates = [];

      for (const id of cardIds) {
        order += 1;
        const added = await addCardToDeck(id, {
          deck: deck.name,
          priority: deck.priority,
          order,
        });

        if (added?.type === "create") {
          creates.push(added.card);
        } else if (added?.type === "put") {
          updates.push(added.card);
        }
      }

      await db.cards.bulkAdd(creates);
      await db.cards.bulkPut(updates);
    }
  });
}

function removeCardFromDeck(card: Card, deckName: string) {
  const deckIndex = card.decks.indexOf(deckName);
  if (deckIndex !== -1) {
    card.decks.splice(deckIndex, 1);
  }

  const positionIndex = card.deckPositions.findIndex(
    (other) => other.deck === deckName
  );
  if (positionIndex !== -1) {
    const [position] = card.deckPositions.splice(positionIndex, 1);

    if (position.priority === card.priority && position.order === card.order) {
      // adjust the new position.
      let priority = Number.POSITIVE_INFINITY;
      let order = Number.POSITIVE_INFINITY;

      for (const other of card.deckPositions) {
        if (other.priority < priority) {
          priority = other.priority;
          order = other.order;
        }
      }

      card.priority = priority;
      card.order = order;
    }
  }
}

export function browserRemoveDeck(name: string) {
  return db.transaction("rw", [db.cards, db.decks], async () => {
    await db.decks.delete(name);

    const updateCards = await db.cards.where("decks").equals(name).toArray();

    for (const card of updateCards) {
      removeCardFromDeck(card, name);
    }

    await db.cards.bulkPut(updateCards);
  });
}

export async function browserRemoveCategory(category: string) {
  const decks = await db.decks.where("category").equals(category).toArray();

  for (const deck of decks) {
    await browserRemoveDeck(deck.name);
  }
}
