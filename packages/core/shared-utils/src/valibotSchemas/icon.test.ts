import * as v from "valibot";
import { expect, it } from "vitest";
import icon from "./icon.js";

it("empty string is not valid", () => {
  // Exercise
  const isValid = v.is(icon(), "");

  // Verify
  expect(isValid).toBe(false);
});

it("non-emoji is not valid", () => {
  // Exercise
  const isValid = v.is(icon(), "A");

  // Verify
  expect(isValid).toBe(false);
});

it("emoji is valid", () => {
  // Exercise
  const isValid = v.is(icon(), "💡");

  // Verify
  expect(isValid).toBe(true);
});
