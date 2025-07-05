import { describe, expect, it } from "vitest";
import replaceValueAtPath from "./replaceValueAtPath.js";

describe("replaces the value at path of obj", () => {
  it("case: one object level", () => {
    // Exercise
    const obj = { a: 1 };
    replaceValueAtPath(obj, ["a"], 2);
    // Verify
    expect(obj).toEqual({ a: 2 });
  });

  it("case: multiple object levels", () => {
    // Exercise
    const obj = { a: { b: { c: 1 } } };
    replaceValueAtPath(obj, ["a", "b", "c"], 2);
    // Verify
    expect(obj).toEqual({ a: { b: { c: 2 } } });
  });

  it("case: one array level", () => {
    // Exercise
    const obj = [1, 2, 3];
    replaceValueAtPath(obj, ["0"], 2);
    // Verify
    expect(obj).toEqual([2, 2, 3]);
  });

  it("case: multiple array levels", () => {
    // Exercise
    const obj = [[1, 2, 3]];
    replaceValueAtPath(obj, ["0", "0"], 2);
    // Verify
    expect(obj).toEqual([[2, 2, 3]]);
  });

  it("case: multiple object and array levels", () => {
    // Exercise
    const obj = { a: [{ b: [{ c: 1 }] }] };
    replaceValueAtPath(obj, ["a", "0", "b", "0", "c"], 2);
    // Verify
    expect(obj).toEqual({ a: [{ b: [{ c: 2 }] }] });
  });
});

it("throws if path is empty", () => {
  // Exercise and verify
  expect(() => replaceValueAtPath({}, [], {})).toThrowError(
    "Path cannot be empty.",
  );
});

it("throws if obj has no value at path", () => {
  // Exercise and verify
  expect(() => replaceValueAtPath({}, ["a"], {})).toThrowError(
    "No value found at path.",
  );
});
