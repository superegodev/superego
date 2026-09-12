import * as v from "valibot";
import { assert, expect, it } from "vitest";
import defaultAppPermissions from "../defaultAppPermissions.js";
import appPermissions from "./appPermissions.js";

it("accepts explicit restrictive permissions", () => {
  // Exercise
  const result = v.parse(appPermissions(), defaultAppPermissions);

  // Verify
  expect(result).toEqual(defaultAppPermissions);
});

it("rejects unknown permissions", () => {
  // Exercise
  const result = v.safeParse(appPermissions(), {
    ...defaultAppPermissions,
    scripts: true,
  });

  // Verify
  expect(result.success).toBe(false);
});

it.each([
  undefined,
  {},
  { downloads: false, http: { allowedOrigins: [] } },
  { modals: false, http: { allowedOrigins: [] } },
  { modals: false, downloads: false },
  { ...defaultAppPermissions, http: {} },
])("rejects incomplete permissions: %j", (permissions) => {
  // Exercise
  const result = v.safeParse(appPermissions(), permissions);

  // Verify
  expect(result.success).toBe(false);
});

it("preserves enabled permissions and normalized HTTP origins", () => {
  // Setup SUT
  const permissions = {
    modals: true,
    downloads: true,
    http: { allowedOrigins: ["https://example.com", "http://localhost:8080"] },
  };

  // Exercise
  const result = v.parse(appPermissions(), permissions);

  // Verify
  expect(result).toEqual(permissions);
});

it("reports each invalid origin at its list index", () => {
  // Exercise
  const result = v.safeParse(appPermissions(), {
    ...defaultAppPermissions,
    http: {
      allowedOrigins: [
        "https://example.com",
        "https://example.com/path",
        "http://localhost:8080",
        "https://*.example.com",
      ],
    },
  });

  // Verify
  assert(!result.success);
  expect(result.issues.map((issue) => v.getDotPath(issue))).toEqual([
    "http.allowedOrigins.1",
    "http.allowedOrigins.3",
  ]);
});

it("supports a translated origin error without changing validation", () => {
  // Setup SUT
  const message = "Inserisci un’origine HTTP(S) valida.";

  // Exercise
  const result = v.safeParse(appPermissions(message), {
    ...defaultAppPermissions,
    http: { allowedOrigins: ["https://example.com/path"] },
  });

  // Verify
  assert(!result.success);
  expect(result.issues).toHaveLength(1);
  expect(result.issues[0].message).toBe(message);
  expect(v.getDotPath(result.issues[0])).toBe("http.allowedOrigins.0");
});
