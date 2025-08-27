import { expect, it } from "vitest";
import formatDescription from "./formatDescription.js";

it("joins paragraphs spanning multiple lines into a single line", () => {
  // Exercise
  const description = formatDescription(`
    Paragraph
    spanning multiple
    lines.
  `);

  // Verify
  expect(description).toEqual("Paragraph spanning multiple lines.");
});

it("maintains the paragraph separation", () => {
  // Exercise
  const description = formatDescription(`
    Paragraph
    spanning multiple
    lines.

    Another paragraph
    spanning multiple
    lines.
  `);

  // Verify
  expect(description).toEqual(
    [
      "Paragraph spanning multiple lines.",
      "Another paragraph spanning multiple lines.",
    ].join("\n"),
  );
});
