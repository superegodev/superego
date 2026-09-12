/** Checks whether a value can round-trip through JSON without changing. */
export default function isJsonInvariant(
  value: unknown,
  ancestors = new Set<object>(),
): boolean {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return true;
  }
  if (typeof value === "number") {
    return Number.isFinite(value);
  }
  if (typeof value !== "object" || ancestors.has(value)) {
    return false;
  }
  if (!Array.isArray(value) && !isPlainObject(value)) {
    return false;
  }
  ancestors.add(value);
  const valid = Array.isArray(value)
    ? value.every((element) => isJsonInvariant(element, ancestors))
    : Object.values(value).every((propertyValue) =>
        isJsonInvariant(propertyValue, ancestors),
      );
  ancestors.delete(value);
  return valid;
}

/**
 * Checks if value is a plain object, that is, an object created by the Object
 * constructor or one with a [[Prototype]] of null.
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  let prototype = value;
  while (Object.getPrototypeOf(prototype) !== null) {
    prototype = Object.getPrototypeOf(prototype);
  }

  return (
    Object.getPrototypeOf(value) === prototype ||
    Object.getPrototypeOf(value) === null
  );
}
