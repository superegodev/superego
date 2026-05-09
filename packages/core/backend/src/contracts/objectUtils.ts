import * as v from "valibot";

/**
 * Returns a new object schema with the specified keys removed from the
 * original schema's entries. Used for types declared in Backend.ts as
 * `Omit<X, "..." | "...">`.
 */
export function omitEntries<
  Entries extends Record<string, v.GenericSchema>,
  Keys extends keyof Entries,
>(entries: Entries, keys: readonly Keys[]): Omit<Entries, Keys> {
  const result: Record<string, v.GenericSchema> = { ...entries };
  for (const key of keys) {
    delete result[key as string];
  }
  return result as Omit<Entries, Keys>;
}
