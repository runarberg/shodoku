import { IDBPObjectStore } from "idb";
import { createEmptyCard, FSRS, generatorParameters, State } from "ts-fsrs";

import { liveQueryBroadcaster } from "../helpers/channels.ts";
import { Card, CardType, Deck, DeckTemplate } from "../types.ts";

import { db, DB } from "./index.ts";

function isNotNull<T>(thing: T | null | undefined): thing is T {
  return thing != null;
}

async function addCardToDeck(
  cards: IDBPObjectStore<
    DB,
    Array<"decks" | "cards" | "progress">,
    "cards",
    "readwrite"
  >,
  progress: IDBPObjectStore<
    DB,
    Array<"decks" | "cards" | "progress">,
    "progress",
    "readwrite"
  >,
  id: number,
  order: number,
  deck: Deck
) {
  const card = await cards.get(id);
  if (card) {
    if (card.decks.includes(deck.name)) {
      return;
    }

    card.decks.push(deck.name);
    card.deckPositions.push({
      deck: deck.name,
      priority: deck.priority,
      order,
    });
    if (deck.priority === card.position.priority) {
      card.position.order = Math.min(order, card.position.order);
    } else if (deck.priority < card.position.priority) {
      card.position.priority = deck.priority;
      card.position.order = order;
    }

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
    });

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

export async function browserAddDeck(deck: Deck) {
  const tx = (await db).transaction(
    ["cards", "decks", "progress"],
    "readwrite"
  );

  const decks = tx.objectStore("decks");
  await decks.add(deck);

  const cards = tx.objectStore("cards");
  const progress = tx.objectStore("progress");

  let order = 0;
  for (const id of deck.cards) {
    order += 1;
    await addCardToDeck(cards, progress, id, order, deck);
  }

  await tx.done;
  liveQueryBroadcaster.postMessage("deck-added");
}

export async function browserAddCategory(
  category: string,
  deckTemplates: DeckTemplate[]
) {
  const storedDecks = await (
    await db
  ).getAllKeysFromIndex("decks", "category", category);

  const decks = await Promise.all(
    deckTemplates
      .filter(({ name }) => !storedDecks.includes(name))
      .map(async ({ name, label, priority, content }) => {
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
        };
      })
  );

  const tx = (await db).transaction(
    ["cards", "decks", "progress"],
    "readwrite"
  );

  const decksStore = tx.objectStore("decks");
  const cardsStore = tx.objectStore("cards");
  const progressStore = tx.objectStore("progress");

  for (const deck of decks) {
    await decksStore.add(deck);

    let order = 0;
    for (const id of deck.cards) {
      order += 1;
      await addCardToDeck(cardsStore, progressStore, id, order, deck);
    }
  }

  await tx.done;
  liveQueryBroadcaster.postMessage("deck-category-added");
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
  }
}

export async function browserRemoveDeck(name: string) {
  const tx = (await db).transaction(["cards", "decks"], "readwrite");
  const decks = tx.objectStore("decks");
  const cards = tx.objectStore("cards");

  await decks.delete(name);

  const cardsInDeck = cards.index("decks").iterate(IDBKeyRange.only(name));

  for await (const cursor of cardsInDeck) {
    const card = cursor.value;

    removeCardFromDeck(cursor.value, name);

    cursor.update(card);
  }

  await tx.done;
  liveQueryBroadcaster.postMessage("deck-removed");
}

export async function browserRemoveCategory(category: string) {
  const tx = (await db).transaction(["cards", "decks"], "readwrite");
  const decks = await tx
    .objectStore("decks")
    .index("category")
    .getAllKeys(category);

  for (const deck of decks) {
    await browserRemoveDeck(deck);
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
