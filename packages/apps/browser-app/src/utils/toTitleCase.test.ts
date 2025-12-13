import { describe, expect, it } from "vitest";
import toTitleCase from "./toTitleCase.js";

describe("formats a string into title case", () => {
  const testCases: { identifier: string; expected: string }[] = [
    { identifier: "camelCase", expected: "Camel Case" },
    { identifier: "PascalCase", expected: "Pascal Case" },
    { identifier: "snake_case", expected: "Snake Case" },
    { identifier: "Mixed_andMatched_case", expected: "Mixed And Matched Case" },
    {
      identifier: "withAcronymsABCDelta",
      expected: "With Acronyms ABC Delta",
    },
    {
      identifier: "withTerminalAcronymsABC",
      expected: "With Terminal Acronyms ABC",
    },
    {
      identifier: "withShortAcronymsABCharlie",
      expected: "With Short Acronyms AB Charlie",
    },
    {
      identifier: "withLongAcronymsABCDEFGHotel",
      expected: "With Long Acronyms ABCDEFG Hotel",
    },
    {
      identifier: "withFakeAcronymsABravo",
      expected: "With Fake Acronyms A Bravo",
    },
  ];
  it.each(testCases)("case: $identifier -> $expected", ({
    identifier,
    expected,
  }) => {
    // Exercise
    const formatted = toTitleCase(identifier);

    // Verify
    expect(formatted).toEqual(expected);
  });
});
