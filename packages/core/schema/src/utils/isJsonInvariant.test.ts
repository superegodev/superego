import { expect, it } from "vitest";
import isJsonInvariant from "./isJsonInvariant.js";

it.each([
  undefined,
  new Date(),
  Infinity,
  -Infinity,
  Number.NaN,
  () => {},
  Symbol("value"),
  1n,
])("rejects non-JSON-invariant nested values: %s", (value) => {
  // Exercise
  const valid = isJsonInvariant({ value });
  // Verify
  expect(valid).toBe(false);
});

it("rejects cycles through objects and arrays", () => {
  // Setup SUT
  const cyclicObject: Record<string, unknown> = {};
  cyclicObject["self"] = cyclicObject;
  const cyclicArray: unknown[] = [];
  cyclicArray.push({ parent: cyclicArray });
  // Exercise
  const results = [cyclicObject, cyclicArray].map((value) =>
    isJsonInvariant(value),
  );
  // Verify
  expect(results).toEqual([false, false]);
});

it("accepts repeated references that do not form a cycle", () => {
  // Setup SUT
  const sharedValue = { count: 1 };
  // Exercise
  const valid = isJsonInvariant({ first: sharedValue, second: [sharedValue] });
  // Verify
  expect(valid).toBe(true);
});

it.each([
  null,
  true,
  "value",
  42,
  [],
  { nested: [null, false, "value", 1] },
  Object.create(null),
])("accepts JSON-invariant values: %j", (value) => {
  // Exercise
  const valid = isJsonInvariant(value);
  // Verify
  expect(valid).toBe(true);
});
