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
