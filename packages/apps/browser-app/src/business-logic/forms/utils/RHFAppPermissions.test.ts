import type { AppPermissions } from "@superego/backend";
import { describe, expect, it } from "vitest";
import RHFAppPermissionsUtils from "./RHFAppPermissions.js";

describe("RHFAppPermissions", () => {
  it.each([
    { allowedOrigins: [] },
    { allowedOrigins: ["https://api.example.com", "http://localhost:3000"] },
  ])(
    "preserves permissions through a form round trip with origins $allowedOrigins",
    ({ allowedOrigins }) => {
      // Setup SUT
      const permissions: AppPermissions = {
        modals: true,
        downloads: false,
        http: { allowedOrigins },
      };

      // Exercise
      const formPermissions =
        RHFAppPermissionsUtils.toRhfAppPermissions(permissions);
      const result =
        RHFAppPermissionsUtils.fromRhfAppPermissions(formPermissions);

      // Verify
      expect(formPermissions.http.allowedOrigins).toEqual(
        allowedOrigins.map((value) => ({ value })),
      );
      expect(result).toEqual(permissions);
    },
  );

  it("saves edited origins without field IDs or changes to the original permissions", () => {
    // Setup SUT
    const permissions: AppPermissions = {
      modals: false,
      downloads: true,
      http: { allowedOrigins: ["https://original.example.com"] },
    };
    const formPermissions =
      RHFAppPermissionsUtils.toRhfAppPermissions(permissions);

    // Exercise
    formPermissions.http.allowedOrigins.splice(0, 1);
    const addedOrigin = { id: "field-id", value: "https://added.example.com" };
    formPermissions.http.allowedOrigins.push(addedOrigin);
    const result =
      RHFAppPermissionsUtils.fromRhfAppPermissions(formPermissions);

    // Verify
    expect(result).toEqual({
      modals: false,
      downloads: true,
      http: { allowedOrigins: ["https://added.example.com"] },
    });
    expect(permissions.http.allowedOrigins).toEqual([
      "https://original.example.com",
    ]);
  });
});
