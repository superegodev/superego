import { defaultAppPermissions } from "@superego/shared-utils";
import * as v from "valibot";
import { expect, it } from "vitest";
import { appPermissions } from "./app.js";

it("accepts explicit restrictive permissions and rejects unknown permissions", () => {
  // Exercise
  const valid = v.parse(appPermissions(), defaultAppPermissions);
  const invalid = v.safeParse(appPermissions(), { scripts: true });

  // Verify
  expect(valid).toEqual(defaultAppPermissions);
  expect(invalid.success).toBe(false);
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
