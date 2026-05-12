import * as v from "valibot";
import { expect, it } from "vitest";
import makeErrorSchema from "./makeErrorSchema.js";
import makeResultSchema from "./makeResultSchema.js";

const dataSchema = v.strictObject({ value: v.string() });
const errorASchema = makeErrorSchema(
  "ErrorA",
  v.strictObject({ a: v.string() }),
);
const errorBSchema = makeErrorSchema(
  "ErrorB",
  v.strictObject({ b: v.number() }),
);

it("accepts a successful result envelope", () => {
  // Setup SUT
  const schema = makeResultSchema(dataSchema, [errorASchema, errorBSchema]);

  // Exercise
  const result = v.safeParse(schema, {
    success: true,
    data: { value: "hello" },
    error: null,
  });

  // Verify
  expect(result.success).toBe(true);
});

it("accepts an unsuccessful result envelope with a known error", () => {
  // Setup SUT
  const schema = makeResultSchema(dataSchema, [errorASchema, errorBSchema]);

  // Exercise
  const result = v.safeParse(schema, {
    success: false,
    data: null,
    error: { name: "ErrorA", details: { a: "x" } },
  });

  // Verify
  expect(result.success).toBe(true);
});

it("rejects an unsuccessful result with an unknown error name", () => {
  // Setup SUT
  const schema = makeResultSchema(dataSchema, [errorASchema, errorBSchema]);

  // Exercise
  const result = v.safeParse(schema, {
    success: false,
    data: null,
    error: { name: "ErrorC", details: {} },
  });

  // Verify
  expect(result.success).toBe(false);
});

it("rejects a successful result whose data does not match the dataSchema", () => {
  // Setup SUT
  const schema = makeResultSchema(dataSchema, [errorASchema]);

  // Exercise
  const result = v.safeParse(schema, {
    success: true,
    data: { value: 42 },
    error: null,
  });

  // Verify
  expect(result.success).toBe(false);
});

it("works with a single-error variant", () => {
  // Setup SUT
  const schema = makeResultSchema(dataSchema, [errorASchema]);

  // Exercise
  const successResult = v.safeParse(schema, {
    success: true,
    data: { value: "y" },
    error: null,
  });
  const errorResult = v.safeParse(schema, {
    success: false,
    data: null,
    error: { name: "ErrorA", details: { a: "x" } },
  });

  // Verify
  expect(successResult.success).toBe(true);
  expect(errorResult.success).toBe(true);
});
