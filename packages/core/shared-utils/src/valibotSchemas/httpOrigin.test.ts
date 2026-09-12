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
  "https://example.com/",
  "http://localhost:8080/",
  "https://EXAMPLE.com",
  "HTTPS://example.com",
  "https://example.com:443",
  "http://example.com:80",
  "http://127.1:8080",
  "http://0x7f000001",
  "http://[0:0:0:0:0:0:0:1]",
])("rejects %s", (origin) => {
  // Exercise
  const result = v.safeParse(httpOrigin(), origin);
  // Verify
  expect(result.success).toBe(false);
});

it.each([
  "https://example.com",
  "http://example.com",
  "https://example.com:8443",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://[::1]",
])("preserves normalized origin %s", (origin) => {
  // Exercise
  const result = v.parse(httpOrigin(), origin);
  // Verify
  expect(result).toBe(origin);
});
