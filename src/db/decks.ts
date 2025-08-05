import { IDBPTransaction } from "idb";
import { createEmptyCard, FSRS, generatorParameters, State } from "ts-fsrs";

import { liveQueryBroadcaster } from "../helpers/channels.ts";
import { randomId } from "../helpers/random.ts";
import {
  Card,
  CardProgress,
  CardType,
  Deck,
  DeckTemplate,
  Optional,
} from "../types.ts";
import { db } from "./index.ts";
import { DB } from "./schema.ts";
import { addToSyncStaging } from "./sync.ts";

function isNotNull<T>(thing: T | null | undefined): thing is T {
  return thing != null;
}

async function maybeCreateCard(
  tx: IDBPTransaction<DB, Array<"cards" | "progress" | "decks">, "readwrite">,
  id: number,
) {
  const cards = tx.objectStore("cards");
  const progress = tx.objectStore("progress");
  const now = new Date();

  if (!(await cards.getKey(id))) {
    const card: Card = {
      id,
      value: String.fromCodePoint(id),
      types: ["kanji-read", "kanji-write"],
      createdAt: now,
    };

    const writeProgress: CardProgress = {
      cardId: id,
      cardType: "kanji-write",
      fsrs: createEmptyCard(),
    };

    const readProgress: CardProgress = {
      cardId: id,
      cardType: "kanji-read",
      fsrs: createEmptyCard(),
    };

    cards.add(card);
    progress.add(writeProgress);
    progress.add(readProgress);

    addToSyncStaging([
      { store: "cards", op: "add", key: id },
      { store: "progress", op: "add", key: [id, "kanji-write"] },
      { store: "progress", op: "add", key: [id, "kanji-read"] },
    ]);
  }
}

export async function activateDeck(
  deckName: string,
  transaction?: IDBPTransaction<
    DB,
    Array<"cards" | "progress" | "decks">,
    "readwrite"
  >,
): Promise<Deck> {
  let tx = transaction;
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

  const updatedAt = new Date();
  await decks.put({
    ...deck,
    active: true,
    updatedAt,
  });

  for (const cardId of deck.cards) {
    maybeCreateCard(tx, cardId);
  }

  addToSyncStaging([{ store: "decks", key: deck.name, op: "put" }]);

  if (newTransaction) {
    await tx.done;
    liveQueryBroadcaster.postMessage("deck-added");
  }

  return deck;
}

export async function activateDeckCategory(
  category: string,
  deckTemplates: DeckTemplate[],
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
    }),
  );

  const tx = (await db).transaction(
    ["cards", "decks", "progress"],
    "readwrite",
  );

  const decksStore = tx.objectStore("decks");

  for (const deckOrName of decks) {
    if (typeof deckOrName === "string") {
      activateDeck(deckOrName, tx);
    } else {
      const deck = { ...deckOrName, createdAt: now };
      await decksStore.add(deck);

      addToSyncStaging([{ store: "decks", op: "add", key: deck.name }]);

      for (const card of deck.cards) {
        maybeCreateCard(tx, card);
      }
    }
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

  const updatedAt = new Date();

  await decks.put({ ...deck, active: false, updatedAt });
  addToSyncStaging([{ store: "decks", op: "put", key: deck.name }]);

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
  fsrs = new FSRS(generatorParameters()),
) {
  const tx = (await db).transaction(["decks", "progress"]);
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
  const deck = await tx.objectStore("decks").get(name);

  if (!deck) {
    return deckStatus;
  }

  for await (const cardId of deck.cards) {
    for (const [cardType, counts] of Object.entries(deckStatus) as Array<
      [type: CardType, count: DeckStatusCount]
    >) {
      const progress = await progressStore.get([cardId, cardType]);

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
    "readwrite",
  );

  await tx.objectStore("decks").add(deck);
  addToSyncStaging([{ store: "decks", op: "add", key: deck.name }]);

  for (const card of deck.cards) {
    maybeCreateCard(tx, card);
  }

  await tx.done;
  liveQueryBroadcaster.postMessage("deck-created");

  return deck;
}

export async function editDeck(deck: Deck): Promise<void> {
  const tx = (await db).transaction(
    ["decks", "cards", "progress"],
    "readwrite",
  );

  const decks = tx.objectStore("decks");
  const previousDeck = await decks.get(deck.name);

  if (!previousDeck) {
    await decks.add(deck);

    addToSyncStaging([{ store: "decks", op: "add", key: deck.name }]);
    liveQueryBroadcaster.postMessage("deck-created");

    return;
  }

  const updatedAt = new Date();
  await decks.put({ ...deck, updatedAt });

  addToSyncStaging([{ store: "decks", op: "put", key: deck.name }]);

  for (const card of deck.cards) {
    if (!previousDeck.cards.includes(card)) {
      maybeCreateCard(tx, card);
    }
  }

  await tx.done;
  liveQueryBroadcaster.postMessage("custom-deck-edited");
}

export async function removeDeck(name: string): Promise<void> {
  const tx = (await db).transaction(["decks", "cards"], "readwrite");

  await tx.objectStore("decks").delete(name);

  addToSyncStaging([{ store: "decks", op: "delete", key: name }]);
  liveQueryBroadcaster.postMessage("custom-deck-removed");
}
