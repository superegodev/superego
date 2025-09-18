import { describe, expect, it } from "vitest";
import formatIdentifier from "./formatIdentifier.js";

describe("formats an identifier into a more human-readable string", () => {
  const testCases: { identifier: string; expected: string }[] = [
    { identifier: "camelCase", expected: "Camel Case" },
    { identifier: "PascalCase", expected: "Pascal Case" },
    { identifier: "snake_case", expected: "Snake Case" },
    { identifier: "SCREAMING_SNAKE_CASE", expected: "Screaming Snake Case" },
    { identifier: "Mixed_andMatched_CASE", expected: "Mixed And Matched Case" },
  ];
  it.each(testCases)(
    "case: $identifier -> $expected",
    ({ identifier, expected }) => {
      // Exercise
      const formatted = formatIdentifier(identifier);

      // Verify
      expect(formatted).toEqual(expected);
    },
  );
});
