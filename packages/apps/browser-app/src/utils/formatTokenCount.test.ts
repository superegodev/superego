import { describe, expect, it } from "vitest";
import formatTokenCount from "./formatTokenCount.js";

describe("formatTokenCount", () => {
  const testCases: { count: number; expected: string }[] = [
    // Below 1k: full number
    { count: 0, expected: "0" },
    { count: 1, expected: "1" },
    { count: 42, expected: "42" },
    { count: 999, expected: "999" },

    // Below 10k: d.ddk
    { count: 1000, expected: "1.00k" },
    { count: 1234, expected: "1.23k" },
    { count: 5678, expected: "5.67k" },
    { count: 9999, expected: "9.99k" },

    // Below 100k: dd.dk
    { count: 10000, expected: "10.0k" },
    { count: 12345, expected: "12.3k" },
    { count: 56789, expected: "56.7k" },
    { count: 99999, expected: "99.9k" },

    // Below 1m: dddk
    { count: 100000, expected: "100k" },
    { count: 123456, expected: "123k" },
    { count: 567890, expected: "567k" },
    { count: 999999, expected: "999k" },

    // Below 10m: d.ddm
    { count: 1000000, expected: "1.00m" },
    { count: 1234567, expected: "1.23m" },
    { count: 9999999, expected: "9.99m" },

    // Below 100m: dd.dm
    { count: 10000000, expected: "10.0m" },
    { count: 12345678, expected: "12.3m" },
    { count: 99999999, expected: "99.9m" },

    // 100m+: dddm
    { count: 100000000, expected: "100m" },
    { count: 123456789, expected: "123m" },
    { count: 999999999, expected: "999m" },
    { count: 9999999999, expected: "9999m" },
  ];

  it.each(testCases)("$count -> $expected", ({ count, expected }) => {
    // Exercise
    const formatted = formatTokenCount(count);

    // Verify
    expect(formatted).toEqual(expected);
  });
});
