function randomBytes(n: number): string {
  return Math.floor(Math.random() * 16 ** n)
    .toString(16)
    .padStart(n, "0");
}

export function randomId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    // Not a secure context. Backup for dev over a local network.
    return [
      randomBytes(8),
      randomBytes(4),
      randomBytes(4),
      randomBytes(4),
      `${randomBytes(6)}${randomBytes(6)}`,
    ].join("-");
  }
}
