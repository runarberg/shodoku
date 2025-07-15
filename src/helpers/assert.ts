type AssertionErrorInit = {
  message?: string;
  actual?: unknown;
};

function actualType(actual: unknown): string {
  if (typeof actual !== "object") {
    return typeof actual;
  }

  if (actual === null) {
    return "null";
  }

  return actual.constructor.name;
}

function expectedTypeMessage(expectedType: string, actual: unknown): string {
  return `Expected "${expectedType}" but got "${actualType(actual)}"`;
}

function expectedKeyTypeMessage(
  key: string,
  expectedType: string,
  actual: unknown
): string {
  return `Expected key "${key}" to be "${expectedType}" but is "${actualType(
    actual
  )}"`;
}

export class AssertionError extends Error {
  name = "AssertationError";
  code = "ERR_ASSERTION";
  actual: unknown;

  constructor(init: AssertionErrorInit = {}) {
    if (init.message) {
      super(init.message);
    } else {
      let message;

      if ("actual" in init) {
        message = `Assertion failed with "${init.actual}"`;
      }

      super(message || "Assertion failed");
    }

    this.actual = init.actual;
  }
}

export function assertIsBoolean<T>(thing: T): asserts thing is T & boolean {
  if (typeof thing !== "boolean") {
    throw new AssertionError({
      message: expectedTypeMessage("Boolean", thing),
      actual: thing,
    });
  }
}

export function assertIsString<T>(thing: T): asserts thing is T & string {
  if (typeof thing !== "string") {
    throw new AssertionError({
      message: expectedTypeMessage("String", thing),
      actual: thing,
    });
  }
}

export function assertIsNumber<T>(thing: T): asserts thing is T & number {
  if (typeof thing !== "number") {
    throw new AssertionError({
      message: expectedTypeMessage("Number", thing),
      actual: thing,
    });
  }
}

export function assertIsArray<T>(
  thing: T
): asserts thing is T & Array<unknown> {
  if (!Array.isArray(thing)) {
    throw new AssertionError({
      message: expectedTypeMessage("Array", thing),
      actual: thing,
    });
  }
}

export function assertIsObject<T>(
  thing: T
): asserts thing is T & Record<PropertyKey, unknown> {
  if (typeof thing !== "object" || thing == null) {
    throw new AssertionError({
      message: expectedTypeMessage("Object", thing),
      actual: thing,
    });
  }
}

export function assertIsNullableObject<T>(
  thing: T
): asserts thing is T & (Record<PropertyKey, unknown> | null) {
  if (typeof thing !== "object") {
    throw new AssertionError({
      message: expectedTypeMessage("Object or null", thing),
      actual: thing,
    });
  }
}

export function assertIsIn<Key extends PropertyKey, T extends object>(
  key: Key,
  thing: T
): asserts thing is T & { [P in Key]: unknown } {
  if (!(key in thing)) {
    throw new AssertionError({
      message: `Expected object to have key "${String(key)}" but none found`,
      actual: thing,
    });
  }
}

export function assertKeyIsString<Key extends PropertyKey, T extends object>(
  key: Key,
  thing: T,
  options?: { optional?: false; nullable?: false }
): asserts thing is T & { [P in Key]: string };
export function assertKeyIsString<Key extends PropertyKey, T extends object>(
  key: Key,
  thing: T,
  options: { optional: boolean; nullable?: false }
): asserts thing is T & { [P in Key]?: string };
export function assertKeyIsString<Key extends PropertyKey, T extends object>(
  key: Key,
  thing: T,
  options: { optional?: false; nullable: boolean }
): asserts thing is T & { [P in Key]: string | null };
export function assertKeyIsString<Key extends PropertyKey, T extends object>(
  key: Key,
  thing: T,
  options: { optional: boolean; nullable: boolean }
): asserts thing is T & { [P in Key]?: string | null };
export function assertKeyIsString<Key extends PropertyKey, T extends object>(
  key: Key,
  thing: T,
  { optional = false, nullable = false } = {}
): asserts thing is T & { [P in Key]?: string | null } {
  if (optional) {
    if (!(key in thing)) {
      return;
    }
  }

  assertIsIn(key, thing);

  if (typeof thing[key] !== "string") {
    if (nullable && thing[key] === null) {
      return;
    }

    if (optional && typeof thing[key] === "undefined") {
      return;
    }

    throw new AssertionError({
      message: expectedKeyTypeMessage(String(key), "String", thing[key]),
      actual: thing,
    });
  }
}

export function assertKeyIsNumber<Key extends PropertyKey, T extends object>(
  key: Key,
  thing: T,
  options?: { optional?: false; nullable?: false }
): asserts thing is T & { [P in Key]: number };
export function assertKeyIsNumber<Key extends PropertyKey, T extends object>(
  key: Key,
  thing: T,
  options: { optional: boolean; nullable?: false }
): asserts thing is T & { [P in Key]?: number };
export function assertKeyIsNumber<Key extends PropertyKey, T extends object>(
  key: Key,
  thing: T,
  options: { optional?: false; nullable: boolean }
): asserts thing is T & { [P in Key]: number | null };
export function assertKeyIsNumber<Key extends PropertyKey, T extends object>(
  key: Key,
  thing: T,
  options: { optional: boolean; nullable: boolean }
): asserts thing is T & { [P in Key]?: number | null };
export function assertKeyIsNumber<Key extends PropertyKey, T extends object>(
  key: Key,
  thing: T,
  { optional = false, nullable = false } = {}
): asserts thing is T & { [P in Key]?: number | null } {
  if (optional && !(key in thing)) {
    return;
  }

  assertIsIn(key, thing);

  if (typeof thing[key] !== "number") {
    if (nullable && thing[key] === null) {
      return;
    }

    if (optional && typeof thing[key] === "undefined") {
      return;
    }

    throw new AssertionError({
      message: expectedKeyTypeMessage(String(key), "Number", thing[key]),
      actual: thing,
    });
  }
}

export function assertKeyIsBoolean<Key extends PropertyKey, T extends object>(
  key: Key,
  thing: T,
  options?: { optional?: false; nullable?: false }
): asserts thing is T & { [P in Key]: boolean };
export function assertKeyIsBoolean<Key extends PropertyKey, T extends object>(
  key: Key,
  thing: T,
  options: { optional: boolean; nullable?: false }
): asserts thing is T & { [P in Key]?: boolean };
export function assertKeyIsBoolean<Key extends PropertyKey, T extends object>(
  key: Key,
  thing: T,
  options: { optional?: false; nullable: boolean }
): asserts thing is T & { [P in Key]: boolean | null };
export function assertKeyIsBoolean<Key extends PropertyKey, T extends object>(
  key: Key,
  thing: T,
  options: { optional: boolean; nullable: boolean }
): asserts thing is T & { [P in Key]?: boolean | null };
export function assertKeyIsBoolean<Key extends PropertyKey, T extends object>(
  key: Key,
  thing: T,
  { optional = false, nullable = false } = {}
): asserts thing is T & { [P in Key]?: boolean | null } {
  if (optional && !(key in thing)) {
    return;
  }

  assertIsIn(key, thing);

  if (typeof thing[key] !== "boolean") {
    if (nullable && thing[key] === null) {
      return;
    }

    if (optional && typeof thing[key] === "undefined") {
      return;
    }

    throw new AssertionError({
      message: expectedKeyTypeMessage(String(key), "Boolean", thing[key]),
      actual: thing,
    });
  }
}

export function assertKeyIsArray<Key extends PropertyKey, T extends object>(
  key: Key,
  thing: T,
  options?: { optional?: false; nullable?: false }
): asserts thing is T & { [P in Key]: Array<unknown> };
export function assertKeyIsArray<Key extends PropertyKey, T extends object>(
  key: Key,
  thing: T,
  options: { optional: boolean; nullable?: false }
): asserts thing is T & { [P in Key]?: Array<unknown> };
export function assertKeyIsArray<Key extends PropertyKey, T extends object>(
  key: Key,
  thing: T,
  options: { optional?: false; nullable: boolean }
): asserts thing is T & { [P in Key]: Array<unknown> | null };
export function assertKeyIsArray<Key extends PropertyKey, T extends object>(
  key: Key,
  thing: T,
  options: { optional: boolean; nullable: boolean }
): asserts thing is T & { [P in Key]?: Array<unknown> | null };
export function assertKeyIsArray<Key extends PropertyKey, T extends object>(
  key: Key,
  thing: T,
  { optional = false, nullable = false } = {}
): asserts thing is T & { [P in Key]?: Array<unknown> | null } {
  if (optional && !(key in thing)) {
    return;
  }

  assertIsIn(key, thing);

  if (!Array.isArray(thing[key])) {
    if (nullable && thing[key] === null) {
      return;
    }

    if (optional && typeof thing[key] === "undefined") {
      return;
    }

    throw new AssertionError({
      message: expectedKeyTypeMessage(String(key), "Array", thing[key]),
      actual: thing,
    });
  }
}

export function assertKeyIsNumberArray<
  Key extends PropertyKey,
  T extends object
>(
  key: Key,
  thing: T,
  options?: { optional?: false; nullable?: false }
): asserts thing is T & { [P in Key]: Array<number> };
export function assertKeyIsNumberArray<
  Key extends PropertyKey,
  T extends object
>(
  key: Key,
  thing: T,
  options: { optional: boolean; nullable?: false }
): asserts thing is T & { [P in Key]?: Array<number> };
export function assertKeyIsNumberArray<
  Key extends PropertyKey,
  T extends object
>(
  key: Key,
  thing: T,
  options: { optional?: false; nullable: boolean }
): asserts thing is T & { [P in Key]: Array<number> | null };
export function assertKeyIsNumberArray<
  Key extends PropertyKey,
  T extends object
>(
  key: Key,
  thing: T,
  options: { optional: boolean; nullable: boolean }
): asserts thing is T & { [P in Key]?: Array<number> | null };
export function assertKeyIsNumberArray<
  Key extends PropertyKey,
  T extends object
>(
  key: Key,
  thing: T,
  { optional = false, nullable = false } = {}
): asserts thing is T & { [P in Key]: Array<number> } {
  assertKeyIsArray(key, thing, { optional, nullable });

  const items = thing[key];
  if (!items) {
    return;
  }

  for (const item of items) {
    assertIsNumber(item);
  }
}

export function assertKeyIsStringArray<
  Key extends PropertyKey,
  T extends object
>(
  key: Key,
  thing: T,
  options?: { optional?: false; nullable?: false }
): asserts thing is T & { [P in Key]: Array<string> };
export function assertKeyIsStringArray<
  Key extends PropertyKey,
  T extends object
>(
  key: Key,
  thing: T,
  options: { optional: boolean; nullable?: false }
): asserts thing is T & { [P in Key]?: Array<string> };
export function assertKeyIsStringArray<
  Key extends PropertyKey,
  T extends object
>(
  key: Key,
  thing: T,
  options: { optional?: false; nullable: boolean }
): asserts thing is T & { [P in Key]: Array<string> | null };
export function assertKeyIsStringArray<
  Key extends PropertyKey,
  T extends object
>(
  key: Key,
  thing: T,
  options: { optional: boolean; nullable: boolean }
): asserts thing is T & { [P in Key]?: Array<string> | null };
export function assertKeyIsStringArray<
  Key extends PropertyKey,
  T extends object
>(
  key: Key,
  thing: T,
  { optional = false, nullable = false } = {}
): asserts thing is T & { [P in Key]: Array<string> } {
  assertKeyIsArray(key, thing, { optional, nullable });

  const items = thing[key];
  if (!items) {
    return;
  }

  for (const item of items) {
    assertIsString(item);
  }
}

export function isNotNull<T>(thing: T | null | undefined): thing is T {
  return thing != null;
}

export function isNumber(thing: unknown): thing is number {
  return typeof thing === "number";
}

export function isString(thing: unknown): thing is string {
  return typeof thing === "string";
}
