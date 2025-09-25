import { fc, it as fit } from "@fast-check/vitest";
import * as v from "valibot";
import { expect, it } from "vitest";
import collectionCategoryName, {
  MAX_LENGTH,
  MIN_LENGTH,
} from "./collectionCategoryName.js";

it("empty string is not valid", () => {
  // Exercise
  const isValid = v.is(collectionCategoryName(), "");

  // Verify
  expect(isValid).toBe(false);
});

fit.prop([fc.string({ minLength: MAX_LENGTH + 1 })])(
  "long string is not valid",
  (name) => {
    // Exercise
    const isValid = v.is(collectionCategoryName(), name);

    // Verify
    expect(isValid).toBe(false);
  },
);

fit.prop([fc.string({ minLength: MIN_LENGTH, maxLength: MAX_LENGTH })])(
  "string within limits is valid",
  (name) => {
    // Exercise
    const isValid = v.is(collectionCategoryName(), name);

    // Verify
    expect(isValid).toBe(true);
  },
);
