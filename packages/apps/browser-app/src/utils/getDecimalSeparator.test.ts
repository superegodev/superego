import { describe, expect, it } from "vitest";
import getDecimalSeparator from "./getDecimalSeparator.js";

describe("returns the correct decimal separator for the locale", () => {
  const testCases: { locale: string; expected: string }[] = [
    { locale: "en-US", expected: "." },
    { locale: "en-GB", expected: "." },
    { locale: "it-IT", expected: "," },
    { locale: "de-DE", expected: "," },
    { locale: "fr-FR", expected: "," },
    { locale: "es-ES", expected: "," },
    { locale: "pt-BR", expected: "," },
    { locale: "ja-JP", expected: "." },
    { locale: "zh-CN", expected: "." },
  ];

  it.each(testCases)("case: $locale -> $expected", ({ locale, expected }) => {
    // Exercise
    const separator = getDecimalSeparator(locale);

    // Verify
    expect(separator).toEqual(expected);
  });
});
