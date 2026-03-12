import { expect, it, vi } from "vitest";

// Importing @superego/themes, which depends on vanilla-extract, would trigger
// vanilla-extract's file-scope check outside of a .css.ts context, causing
// issues.
vi.mock("@superego/themes", async () => {
  const { default: resolveVar } = await import(
    "../../../../../../ui/themes/src/resolveVar.js"
  );
  return { resolveVar };
});

import deepResolveCssVars from "./deepResolveCssVars.js";

const mockStyles = {
  getPropertyValue(name: string): string {
    const values: Record<string, string> = {
      "--reds-4": "#fa5252",
      "--blues-4": "#228be6",
      "--greens-4": "#40c057",
      "--chart-color": "var(--base-color)",
      "--base-color": "#ff8800",
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

it("preserves class instances (e.g. Date) without recursing into them", () => {
  // Exercise
  const date = new Date("2024-01-01");
  const input = { timestamp: date, color: "var(--reds-4)" };
  const result = deepResolveCssVars(input, mockStyles);

  // Verify
  expect(result.timestamp).toBe(date);
  expect(result.timestamp).toBeInstanceOf(Date);
  expect(result.color).toBe("#fa5252");
});

it("preserves class instances nested inside arrays", () => {
  // Exercise
  const date = new Date("2024-01-01");
  const input = [date, "var(--blues-4)"];
  const result = deepResolveCssVars(input, mockStyles);

  // Verify
  expect(result[0]).toBe(date);
  expect(result[1]).toBe("#228be6");
});

it("preserves custom class instances without recursing into them", () => {
  // Exercise
  class LinearGradient {
    type = "linear";
    colorStops = [{ offset: 0, color: "var(--reds-4)" }];
  }
  const gradient = new LinearGradient();
  const input = { style: { color: gradient } };
  const result = deepResolveCssVars(input, mockStyles);

  // Verify
  expect(result.style.color).toBe(gradient);
  expect(result.style.color).toBeInstanceOf(LinearGradient);
  expect(result.style.color.colorStops[0]?.color).toBe("var(--reds-4)");
});

it("resolves aliased CSS variable tokens through to the final value", () => {
  // Exercise
  const result = deepResolveCssVars("var(--chart-color)", mockStyles);

  // Verify
  expect(result).toBe("#ff8800");
});

it("recurses into null-prototype objects", () => {
  // Exercise
  const input = Object.create(null) as Record<string, unknown>;
  input["color"] = "var(--greens-4)";
  const result = deepResolveCssVars(input, mockStyles);

  // Verify
  expect(result["color"]).toBe("#40c057");
});
