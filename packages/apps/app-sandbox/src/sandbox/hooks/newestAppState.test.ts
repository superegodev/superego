import { expect, it } from "vitest";
import newestAppState from "./newestAppState.js";

it("keeps a newer cached revision when a read arrives after a mutation", () => {
  // Setup SUT
  const current = {
    content: { count: 2 },
    revision: 2,
  };
  // Exercise
  const result = newestAppState(current, {
    ...current,
    revision: 1,
    content: { count: 1 },
  });
  // Verify
  expect(result).toBe(current);
});
