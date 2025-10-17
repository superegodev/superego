import { Theme } from "@superego/backend";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { describe, expect, it } from "vitest";
import type GetDependencies from "../GetDependencies.js";

export default rd<GetDependencies>("Global Settings", (deps) => {
  describe("get", () => {
    it("success: returns current global settings", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.globalSettings.get();

      // Verify
      expect(result).toEqual({
        success: true,
        data: expect.objectContaining({
          appearance: { theme: expect.any(String) },
        }),
        error: null,
      });
    });
  });

  describe("update", () => {
    it("success: updates and persists global settings", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const updateResult = await backend.globalSettings.update({
        appearance: { theme: Theme.Dark },
      });

      // Verify
      expect(updateResult).toEqual({
        success: true,
        data: expect.objectContaining({
          appearance: { theme: Theme.Dark },
        }),
        error: null,
      });
      const getResult = await backend.globalSettings.get();
      expect(getResult).toEqual({
        success: true,
        data: updateResult.data,
        error: null,
      });
    });
  });
});
