import { fc, it as fit } from "@fast-check/vitest";
import * as v from "valibot";
import { expect, it } from "vitest";
import contentSummary from "./contentSummary.js";

it("non-valid content summary", () => {
  // Exercise
  const isValid = v.is(contentSummary(), {
    object: {},
  });

  // Verify
  expect(isValid).toBe(false);
});

fit.prop([
  fc.dictionary(
    fc.string(),
    fc.oneof(
      fc.string(),
      fc.float(),
      fc.integer(),
      fc.boolean(),
      fc.constant(null),
    ),
  ),
])("valid content summary", (validContentSummary) => {
  // Exercise
  const isValid = v.is(contentSummary(), validContentSummary);

  // Verify
  expect(isValid).toBe(true);
});
