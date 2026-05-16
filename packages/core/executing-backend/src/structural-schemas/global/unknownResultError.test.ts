import * as v from "valibot";
import { expect, it } from "vitest";
import unknownResultError from "./unknownResultError.js";

it("accepts a ResultError record", () => {
  // Setup SUT
  const schema = unknownResultError();

  // Exercise
  const result = v.safeParse(schema, {
    name: "ErrorName",
    details: { key: "value" },
  });

  // Verify
  expect(result.success).toBe(true);
});

it("rejects extra top-level properties", () => {
  // Setup SUT
  const schema = unknownResultError();

  // Exercise
  const result = v.safeParse(schema, {
    name: "ErrorName",
    details: { key: "value" },
    extra: true,
  });

  // Verify
  expect(result.success).toBe(false);
});
