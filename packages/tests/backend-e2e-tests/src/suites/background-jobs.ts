import { registeredDescribe as rd } from "@superego/vitest-registered";
import { assert, describe, expect, it } from "vitest";
import type GetDependencies from "../GetDependencies.js";

export default rd<GetDependencies>("Background Jobs", (deps) => {
  describe("list", () => {
    it("success: returns empty array when there are no background jobs", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.backgroundJobs.list();

      // Verify
      expect(result).toEqual({
        success: true,
        data: [],
        error: null,
      });
    });
  });

  describe("get", () => {
    it("error: ArgumentsNotValid", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.backgroundJobs.get("not-a-valid-id" as any);

      // Verify
      assert(!result.success);
      expect(result.error.name).toBe("ArgumentsNotValid");
    });
  });
});
