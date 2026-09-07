import * as v from "valibot";
import { expect, it } from "vitest";
import httpOrigin from "./httpOrigin.js";

it.each([
  "file:///tmp",
  "https://*.example.com",
  "https://%2A.example.com",
  "https://%2a.example.com",
  "https://api*.example.com",
  "https://example.com/path",
  "https://example.com?token=secret",
  "https://user:pass@example.com",
  "https://example.com/#fragment",
  "https://example.com;connect-src",
  "https://example.com; connect-src *",
  "https://example.com%3Bconnect-src",
  "https://exam\tple.com",
  "https://example.com\n",
])("rejects %s", (origin) => {
  // Exercise
  const result = v.safeParse(httpOrigin(), origin);
  // Verify
  expect(result.success).toBe(false);
});

it("normalizes origins", () => {
  // Exercise
  const origin = v.parse(httpOrigin(), "HTTPS://EXAMPLE.COM:443/");
  // Verify
  expect(origin).toBe("https://example.com");
});
