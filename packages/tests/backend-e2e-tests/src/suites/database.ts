import { registeredDescribe as rd } from "@superego/vitest-registered";
import { describe, expect, it } from "vitest";
import type GetDependencies from "../GetDependencies.js";

export default rd<GetDependencies>("Database", (deps) => {
  describe("export", () => {
    it.skipIf(typeof window !== "undefined")(
      "success: exports database to file",
      async () => {
        // Setup SUT
        const { existsSync } = await import("node:fs");
        const { tmpdir } = await import("node:os");
        const { join } = await import("node:path");
        const { backend } = deps();

        // Exercise
        const exportPath = join(
          tmpdir(),
          "superego-backend-e2e-tests",
          `export-test-${crypto.randomUUID()}.sqlite`,
        );
        const result = await backend.database.export(exportPath);

        // Verify
        expect(result).toEqual({
          success: true,
          data: null,
          error: null,
        });
        expect(existsSync(exportPath)).toBe(true);
      },
    );
  });
});
