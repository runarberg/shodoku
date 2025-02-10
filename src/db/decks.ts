import { IDBPTransaction } from "idb";
import { createEmptyCard, FSRS, generatorParameters, State } from "ts-fsrs";

import { liveQueryBroadcaster } from "../helpers/channels.ts";
import { randomId } from "../helpers/random.ts";
import { Card, CardType, Deck, DeckTemplate, Optional } from "../types.ts";

import { db, DB } from "./index.ts";

function isNotNull<T>(thing: T | null | undefined): thing is T {
  return thing != null;
}

async function addCardToDeck(
  tx: IDBPTransaction<DB, Array<"cards" | "progress" | "decks">, "readwrite">,
  id: number,
  order: number,
  deck: Pick<Deck, "name" | "priority">
) {
  const cards = tx.objectStore("cards");

  const card = await cards.get(id);
  const now = new Date();

  if (card) {
    if (card.decks.includes(deck.name)) {
      let updated = false;
      const deckPosition = card.deckPositions.find(
        (other) => other.deck === deck.name
      );

      if (!deckPosition) {
        return;
      }

      if (deckPosition.priority !== deck.priority) {
        deckPosition.priority = deck.priority;
        updated = true;
      }

      if (deckPosition.order !== order) {
        deckPosition.order = order;
        updated = true;
      }

      if (!updated) {
        return;
      }
    } else {
      card.decks.push(deck.name);
      card.deckPositions.push({
        deck: deck.name,
        priority: deck.priority,
        order,
      });
    }

    let newPriority = Number.POSITIVE_INFINITY;
    let newOrder = Number.POSITIVE_INFINITY;
    for (const deckPosition of card.deckPositions) {
      if (deckPosition.priority < newPriority) {
        newPriority = deckPosition.priority;
        newOrder = deckPosition.order;
      } else if (
        deckPosition.priority === newPriority &&
        deckPosition.order < newOrder
      ) {
        newOrder = deckPosition.order;
      }
    }

    card.position.priority = newPriority;
    card.position.order = newOrder;
    card.updatedAt = now;

    await cards.put(card);
  } else {
    await cards.add({
      id,
      value: String.fromCodePoint(id),
      types: ["kanji-read", "kanji-write"],
      decks: [deck.name],
      position: {
        priority: deck.priority,
        order,
      },
      deckPositions: [{ deck: deck.name, priority: deck.priority, order }],
      createdAt: now,
    });

    const progress = tx.objectStore("progress");

    await progress.add({
      cardId: id,
      cardType: "kanji-write",
      fsrs: createEmptyCard(),
    });

    await progress.add({
      cardId: id,
      cardType: "kanji-read",
      fsrs: createEmptyCard(),
    });
  }
}

export async function addDeckCards(
  tx: IDBPTransaction<DB, Array<"cards" | "progress" | "decks">, "readwrite">,
  deck: Pick<Deck, "name" | "priority" | "cards">
) {
  let order = 0;
  for (const cardId of deck.cards) {
    order += 1;
    await addCardToDeck(tx, cardId, order, deck);
  }
}

async function updateDeckCards(
  tx: IDBPTransaction<DB, Array<"cards" | "progress" | "decks">, "readwrite">,
  previousDeck: Pick<Deck, "name" | "priority" | "cards">,
  deck: Pick<Deck, "name" | "priority" | "cards">
) {
  const cards = tx.objectStore("cards");

  let order = 0;
  for (const cardId of deck.cards) {
    order += 1;
    await addCardToDeck(tx, cardId, order, deck);
  }

  for (const oldCardId of previousDeck.cards) {
    if (!deck.cards.includes(oldCardId)) {
      const card = await cards.get(oldCardId);
      if (card) {
        removeCardFromDeck(card, deck.name);
        await cards.put(card);
      }
    }
  }
}

function removeCardFromDeck(card: Card, deckName: string) {
  const deckIndex = card.decks.indexOf(deckName);
  if (deckIndex !== -1) {
    card.decks.splice(deckIndex, 1);
  }

  const positionIndex = card.deckPositions.findIndex(
    (other) => other.deck === deckName
  );

  if (positionIndex === -1) {
    return;
  }

  const [position] = card.deckPositions.splice(positionIndex, 1);

  if (
    position.priority === card.position.priority &&
    position.order === card.position.order
  ) {
    // adjust the new position.
    let priority = Number.POSITIVE_INFINITY;
    let order = Number.POSITIVE_INFINITY;

    for (const other of card.deckPositions) {
      if (other.priority < priority) {
        priority = other.priority;
        order = other.order;
      }
    }

    card.position.priority = priority;
    card.position.order = order;
  }

  card.updatedAt = new Date();
}

async function removeDeckCards(
  tx: IDBPTransaction<DB, Array<"cards" | "progress" | "decks">, "readwrite">,
  deckName: string
) {
  const cardsInDeck = tx
    .objectStore("cards")
    .index("decks")
    .iterate(IDBKeyRange.only(deckName));

  for await (const cursor of cardsInDeck) {
    const card = cursor.value;

    removeCardFromDeck(cursor.value, deckName);

    await cursor.update(card);
  }
}

export async function activateDeck(
  deckName: string,
  tx?: IDBPTransaction<DB, Array<"cards" | "progress" | "decks">, "readwrite">
): Promise<Deck> {
  let newTransaction = false;
  if (!tx) {
    newTransaction = true;
    tx = (await db).transaction(["cards", "decks", "progress"], "readwrite");
  }

  const decks = tx.objectStore("decks");
  const deck = await decks.get(deckName);

  if (!deck) {
    throw new Error("Deck does not exist");
  }

  if (deck.active) {
    return deck;
  }

  await decks.put({
    ...deck,
    active: true,
    updatedAt: new Date(),
  });

  await addDeckCards(tx, deck);

  if (newTransaction) {
    await tx.done;
    liveQueryBroadcaster.postMessage("deck-added");
  }

  return deck;
}

export async function activateDeckCategory(
  category: string,
  deckTemplates: DeckTemplate[]
) {
  const now = new Date();
  const decks: Array<Omit<Deck, "createdAt"> | string> = await Promise.all(
    deckTemplates.map(async ({ name, label, priority, content }) => {
      const isStored = await (await db).getKey("decks", name);

      if (isStored) {
        return name;
      }

      const response = await fetch(content);
      const csv = await response.text();

      const cards = csv
        .split("\n")
        .map((line) => line.codePointAt(0))
        .filter(isNotNull);

      return {
        name,
        label,
        priority,
        category,
        cards,
        active: true,
      };
    })
  );

  const tx = (await db).transaction(
    ["cards", "decks", "progress"],
    "readwrite"
  );

  const decksStore = tx.objectStore("decks");

  for (const deckOrName of decks) {
    let deck: Deck;
    if (typeof deckOrName === "string") {
      deck = await activateDeck(deckOrName, tx);
    } else {
      deck = { ...deckOrName, createdAt: now };
      await decksStore.add(deck);
    }

    await addDeckCards(tx, deck);
  }

  await tx.done;
  liveQueryBroadcaster.postMessage("deck-category-added");
}

export async function deactivateDeck(deckName: string) {
  const tx = (await db).transaction(["cards", "decks"], "readwrite");
  const decks = tx.objectStore("decks");

  const deck = await decks.get(deckName);
  if (!deck || !deck.active) {
    return;
  }

  await decks.put({ ...deck, active: false, updatedAt: new Date() });
  await removeDeckCards(tx, deckName);
  await tx.done;

  liveQueryBroadcaster.postMessage("deck-removed");
}

export async function deactivateDeckCategory(category: string) {
  const tx = (await db).transaction(["cards", "decks"], "readwrite");
  const decks = await tx
    .objectStore("decks")
    .index("category")
    .getAllKeys(category);

  for (const deck of decks) {
    await deactivateDeck(deck);
  }

  await tx.done;
}

type DeckStatusCount = {
  new: number;
  due: number;
  review: number;
  know: number;
};

type DeckStatus = { [Property in CardType]: DeckStatusCount };

export async function getDeckStatus(
  name: string,
  fsrs = new FSRS(generatorParameters())
) {
  const tx = (await db).transaction(["cards", "progress"]);
  const cardsStore = tx.objectStore("cards");
  const progressStore = tx.objectStore("progress");

  const deckStatus: DeckStatus = {
    "kanji-read": {
      new: 0,
      due: 0,
      review: 0,
      know: 0,
    },

    "kanji-write": {
      new: 0,
      due: 0,
      review: 0,
      know: 0,
    },
  };

  const now = new Date();
  const cards = cardsStore.index("decks").iterate(IDBKeyRange.only(name));

  for await (const card of cards) {
    for (const [type, counts] of Object.entries(deckStatus) as [
      CardType,
      DeckStatusCount
    ][]) {
      const progress = await progressStore.get([card.primaryKey, type]);

      if (!progress) {
        continue;
      }

      if (progress.fsrs.state === State.New) {
        counts.new += 1;
      } else if (
        progress.fsrs.state === State.Learning ||
        progress.fsrs.state === State.Relearning ||
        progress.fsrs.due < now
      ) {
        counts.due += 1;
      } else if (fsrs.get_retrievability(progress.fsrs, now, false) > 0.99) {
        counts.know += 1;
      } else {
        counts.review += 1;
      }
    }
  }

  return deckStatus;
}

export async function createDeck({
  name = `custom/${randomId()}`,
  active = true,
  createdAt = new Date(),
  ...deckTemplate
}: Optional<Deck, "name" | "active" | "createdAt">): Promise<Deck> {
  const deck: Deck = {
    ...deckTemplate,
    name,
    active,
    createdAt,
  };

  const tx = (await db).transaction(
    ["decks", "cards", "progress"],
    "readwrite"
  );

  await tx.objectStore("decks").add(deck);
  await addDeckCards(tx, deck);
  await tx.done;

  liveQueryBroadcaster.postMessage("deck-created");

  return deck;
}

export async function editDeck(deck: Deck): Promise<void> {
  const tx = (await db).transaction(
    ["decks", "cards", "progress"],
    "readwrite"
  );

  const decks = tx.objectStore("decks");
  const previousDeck = await decks.get(deck.name);

  if (previousDeck) {
    await decks.put({ ...deck, updatedAt: new Date() });
  } else {
    await decks.add(deck);
  }

  if (previousDeck?.active) {
    if (deck.active) {
      await updateDeckCards(tx, previousDeck, deck);
    } else {
      await removeDeckCards(tx, deck.name);
    }
  } else if (deck.active) {
    await addDeckCards(tx, deck);
  }

  await tx.done;
  liveQueryBroadcaster.postMessage("custom-deck-edited");
}

export async function removeDeck(name: string): Promise<void> {
  const tx = (await db).transaction(["decks", "cards"], "readwrite");

  await tx.objectStore("decks").delete(name);
  await removeDeckCards(tx, name);
  await tx.done;

  liveQueryBroadcaster.postMessage("custom-deck-removed");
}
