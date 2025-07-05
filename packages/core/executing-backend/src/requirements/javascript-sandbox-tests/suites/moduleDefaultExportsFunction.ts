import { registeredDescribe as rd } from "@superego/vitest-registered";
import { describe, expect } from "vitest";
import type Dependencies from "../Dependencies.js";

export default rd<Dependencies>("moduleDefaultExportsFunction", (deps, it) => {
  describe("returns whether the supplied module's default export is a function or not", () => {
    it("case: importing the module fails (syntax error) -> false", async () => {
      // Setup SUT
      const { javascriptSandbox } = await deps();

      // Exercise
      const result = await javascriptSandbox.moduleDefaultExportsFunction({
        source: "",
        compiled: `
          export default func add(a, b) {
            return a + b;
          }
        `,
      });

      // Verify
      expect(result).toEqual(false);
    });

    it("case: importing the module fails (module throws) -> false", async () => {
      // Setup SUT
      const { javascriptSandbox } = await deps();

      // Exercise
      const result = await javascriptSandbox.moduleDefaultExportsFunction({
        source: "",
        compiled: `
          throw new Error("Throw!");
          export default function add(a, b) {
            return a + b;
          }
        `,
      });

      // Verify
      expect(result).toEqual(false);
    });

    it("case: module doesn't export anything -> false", async () => {
      // Setup SUT
      const { javascriptSandbox } = await deps();

      // Exercise
      const result = await javascriptSandbox.moduleDefaultExportsFunction({
        source: "",
        compiled: `
         function add(a, b) {
            return a + b;
          }
        `,
      });

      // Verify
      expect(result).toEqual(false);
    });

    it("case: module exports an object -> false", async () => {
      // Setup SUT
      const { javascriptSandbox } = await deps();

      // Exercise
      const result = await javascriptSandbox.moduleDefaultExportsFunction({
        source: "",
        compiled: `
          export default {}
        `,
      });

      // Verify
      expect(result).toEqual(false);
    });

    it("case: module exports a function -> true", async () => {
      // Setup SUT
      const { javascriptSandbox } = await deps();

      // Exercise
      const result = await javascriptSandbox.moduleDefaultExportsFunction({
        source: "",
        compiled: `
         export default function add(a, b) {
            return a + b;
          }
        `,
      });

      // Verify
      expect(result).toEqual(true);
    });

    it("case: module exports an arrow function -> true", async () => {
      // Setup SUT
      const { javascriptSandbox } = await deps();

      // Exercise
      const result = await javascriptSandbox.moduleDefaultExportsFunction({
        source: "",
        compiled: `
         export default (a, b) => {
            return a + b;
          }
        `,
      });

      // Verify
      expect(result).toEqual(true);
    });
  });
});
