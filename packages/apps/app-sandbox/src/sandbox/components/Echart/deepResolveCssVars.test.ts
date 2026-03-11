import { expect, it, vi } from "vitest";

vi.mock("@superego/themes", () => ({
  resolveVar: (styles: CSSStyleDeclaration, value: string) => {
    const match = /^var\(\s*(--[^,\s)]+)\s*\)$/.exec(value.trim());
    if (!match?.[1]) {
      return value;
    }
    return styles.getPropertyValue(match[1])?.trim() || value;
  },
}));

import deepResolveCssVars from "./deepResolveCssVars.js";

const mockStyles = {
  getPropertyValue(name: string): string {
    const values: Record<string, string> = {
      "--reds-4": "#fa5252",
      "--blues-4": "#228be6",
      "--greens-4": "#40c057",
    };
    return values[name] ?? "";
  },
} as CSSStyleDeclaration;

it("resolves a CSS variable string", () => {
  // Exercise
  const result = deepResolveCssVars("var(--reds-4)", mockStyles);

  // Verify
  expect(result).toBe("#fa5252");
});

it("returns plain strings unchanged", () => {
  // Exercise
  const result = deepResolveCssVars("#ff0000", mockStyles);

  // Verify
  expect(result).toBe("#ff0000");
});

it("returns non-string primitives unchanged", () => {
  // Exercise & Verify
  expect(deepResolveCssVars(42, mockStyles)).toBe(42);
  expect(deepResolveCssVars(true, mockStyles)).toBe(true);
  expect(deepResolveCssVars(null, mockStyles)).toBe(null);
  expect(deepResolveCssVars(undefined, mockStyles)).toBe(undefined);
});

it("resolves CSS variables nested in objects", () => {
  // Exercise
  const input = {
    itemStyle: { color: "var(--blues-4)" },
    lineStyle: { color: "var(--greens-4)" },
    name: "Series 1",
    symbolSize: 6,
  };
  const result = deepResolveCssVars(input, mockStyles);

  // Verify
  expect(result).toEqual({
    itemStyle: { color: "#228be6" },
    lineStyle: { color: "#40c057" },
    name: "Series 1",
    symbolSize: 6,
  });
});

it("resolves CSS variables inside arrays", () => {
  // Exercise
  const input = ["var(--reds-4)", "var(--blues-4)"];
  const result = deepResolveCssVars(input, mockStyles);

  // Verify
  expect(result).toEqual(["#fa5252", "#228be6"]);
});

it("does not mutate the original object", () => {
  // Exercise
  const input = { color: "var(--reds-4)" };
  deepResolveCssVars(input, mockStyles);

  // Verify
  expect(input.color).toBe("var(--reds-4)");
});
