import { IDBPTransaction } from "idb";
import { createEmptyCard, FSRS, generatorParameters, State } from "ts-fsrs";

import { liveQueryBroadcaster } from "../helpers/channels.ts";
import { randomId } from "../helpers/random.ts";
import { WEEK } from "../helpers/time.ts";
import { knownMinDueWeeks, knownMinRetention } from "../store/reviews.ts";
import {
  Card,
  CardType,
  Deck,
  DeckTemplate,
  Optional,
  SyncStagingStore,
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
  types: CardType[],
) {
  const cards = tx.objectStore("cards");
  const progress = tx.objectStore("progress");
  const now = new Date();

  if (!(await cards.getKey(id))) {
    const card: Card = {
      id,
      value: String.fromCodePoint(id),
      types,
      createdAt: now,
    };

    cards.add(card);

    for (const type of types) {
      progress.add({
        cardId: id,
        cardType: type,
        fsrs: createEmptyCard(),
      });
    }

    addToSyncStaging([
      { store: "cards", op: "add", key: id },
      ...types.map<SyncStagingStore>((type) => ({
        store: "progress",
        op: "add",
        key: [id, type],
      })),
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
    maybeCreateCard(tx, cardId, ["kanji-write", "kanji-read"]);
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
        cardTypes: ["kanji-write", "kanji-read"],
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
        maybeCreateCard(tx, card, ["kanji-write", "kanji-read"]);
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

export type DeckStatusCount = {
  new: number;
  due: number;
  review: number;
  know: number;
};

function createDeckStatusCount(): DeckStatusCount {
  return {
    new: 0,
    due: 0,
    review: 0,
    know: 0,
  };
}

export async function getDeckStatus(
  name: string,
  fsrs = new FSRS(generatorParameters()),
): Promise<Map<CardType, DeckStatusCount> | null> {
  const tx = (await db).transaction(["decks", "progress"]);
  const progressStore = tx.objectStore("progress");

  const now = new Date();
  const deck = await tx.objectStore("decks").get(name);

  if (!deck) {
    return null;
  }

  const minRetentionProb = knownMinRetention.value / 100;
  const minDueDate = new Date(Date.now() + knownMinDueWeeks.value * WEEK);

  const deckStatus = new Map(
    deck.cardTypes.map((cardType) => [cardType, createDeckStatusCount()]),
  );

  for await (const cardId of deck.cards) {
    for (const cardType of deck.cardTypes) {
      const progress = await progressStore.get([cardId, cardType]);

      if (!progress) {
        continue;
      }

      const counts = deckStatus.get(cardType);

      if (!counts) {
        // never happens
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
      } else if (
        progress.fsrs.due > minDueDate &&
        fsrs.get_retrievability(progress.fsrs, now, false) > minRetentionProb
      ) {
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
  category = "custom",
  createdAt = new Date(),
  ...deckTemplate
}: Optional<
  Deck,
  "name" | "active" | "category" | "createdAt"
>): Promise<Deck> {
  const deck: Deck = {
    ...deckTemplate,
    name,
    active,
    category,
    createdAt,
  };

  const tx = (await db).transaction(
    ["decks", "cards", "progress"],
    "readwrite",
  );

  await tx.objectStore("decks").add(deck);
  addToSyncStaging([{ store: "decks", op: "add", key: deck.name }]);

  for (const card of deck.cards) {
    maybeCreateCard(tx, card, deckTemplate.cardTypes);
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
      maybeCreateCard(tx, card, ["kanji-write", "kanji-read"]);
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
