type MaybePromise<T> = T | Promise<T>;

export async function count<T>(
  items: MaybePromise<AsyncIterable<T>>
): Promise<number> {
  let i = 0;

  for await (const _ of await items) {
    i += 1;
  }

  return i;
}

export async function first<T>(
  items: MaybePromise<AsyncIterable<T>>
): Promise<T | undefined> {
  for await (const item of await items) {
    return item;
  }
}

export async function* take<T>(
  n: number,
  items: AsyncIterable<T>
): AsyncIterable<T> {
  let i = 0;
  for await (const item of items) {
    if (i >= n) {
      return;
    }

    yield item;

    i += 1;
  }
}

export function* zip<T extends unknown[]>(
  ...items: { [K in keyof T]: Iterable<T[K]> }
): Generator<T, void> {
  const iters = items.map((item) => item[Symbol.iterator]());

  try {
    let results = iters.map((iter) => iter.next());

    while (!results.some(({ done }) => done)) {
      yield results.map(({ value }) => value) as T;

      results = iters.map((iter) => iter.next());
    }
  } finally {
    iters.forEach((iter) => {
      if (typeof iter.return === "function") {
        iter.return();
      }
    });
  }
}

export async function* enumerate<T>(
  items: AsyncIterable<T>
): AsyncIterable<[number, T]> {
  let i = 0;
  for await (const item of items) {
    yield [i, item];

    i += 1;
  }
}
