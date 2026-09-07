import { expect, it } from "vitest";
import normalizeHttpOrigin from "./normalizeHttpOrigin.js";

it.each([
  ["HTTPS://EXAMPLE.COM:443/", "https://example.com"],
  ["http://127.1:8080", "http://127.0.0.1:8080"],
  ["http://0x7f000001", "http://127.0.0.1"],
  ["http://[0:0:0:0:0:0:0:1]:80", "http://[::1]"],
])("normalizes %s", (source, expected) => {
  // Exercise
  const origin = normalizeHttpOrigin(source);
  // Verify
  expect(origin).toBe(expected);
});
