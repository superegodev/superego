import { registeredDescribe as rd } from "@superego/vitest-registered";
import { assert, describe, expect } from "vitest";
import type Dependencies from "../Dependencies.js";

export default rd<Dependencies>("executeSyncFunction", (deps, it) => {
  describe("executes the function default-exported by with the supplied module, with the supplied args, and returns the result", () => {
    describe("failed executions", () => {
      it("importing the module fails (syntax error)", async () => {
        // Setup SUT
        const { javascriptSandbox } = await deps();

        // Exercise
        const result = await javascriptSandbox.executeSyncFunction(
          {
            source: "",
            compiled: `
              export default func add(a, b) {
                return a + b;
              }
            `,
          },
          [1, 1],
        );

        // Verify
        assert(!result.success);
        expect(result.error.details).toMatchObject({
          name: expect.stringMatching(/SyntaxError|RollupError/),
        });
      });

      it("importing the module fails (module throws)", async () => {
        // Setup SUT
        const { javascriptSandbox } = await deps();

        // Exercise
        const result = await javascriptSandbox.executeSyncFunction(
          {
            source: "",
            compiled: `
              throw new Error("Throw!");
              export default function add(a, b) {
                return a + b;
              }
            `,
          },
          [1, 1],
        );

        // Verify
        assert(!result.success);
        expect(result.error.details).toMatchObject({
          message: "Throw!",
          name: "Error",
        });
      });

      it("the module does not default-export a function", async () => {
        // Setup SUT
        const { javascriptSandbox } = await deps();

        // Exercise
        const result = await javascriptSandbox.executeSyncFunction(
          {
            source: "",
            compiled: `
              export default {}
            `,
          },
          [1, 1],
        );

        // Verify
        assert(!result.success);
        expect(result.error.details).toMatchObject({
          message: "The default export of the module is not a function",
        });
      });

      it("the function throws an error", async () => {
        // Setup SUT
        const { javascriptSandbox } = await deps();

        // Exercise
        const result = await javascriptSandbox.executeSyncFunction(
          {
            source: "",
            compiled: `
              export default function add(a, b) {
                return a.getValueOf() + b.getValueOf();
              }
            `,
          },
          [1, 1],
        );

        // Verify
        assert(!result.success);
        expect(result.error.details).toMatchObject({
          message: expect.stringMatching("not a function"),
          name: "TypeError",
        });
      });

      it("the function throws a non-error", async () => {
        // Setup SUT
        const { javascriptSandbox } = await deps();

        // Exercise
        const result = await javascriptSandbox.executeSyncFunction(
          {
            source: "",
            compiled: `
              export default function add(a, b) {
                throw null;
              }
            `,
          },
          [1, 1],
        );

        // Verify
        assert(!result.success);
      });

      it("the function returns a value that cannot be serialized", async () => {
        // Setup SUT
        const { javascriptSandbox } = await deps();

        // Exercise
        const result = await javascriptSandbox.executeSyncFunction(
          {
            source: "",
            compiled: `
              export default function add(a, b) {
                return () => null;
              }
            `,
          },
          [1, 1],
        );

        // Verify
        assert(!result.success);
      });
    });

    describe("successful executions", () => {
      it("primitive arguments, primitive return value", async () => {
        // Setup SUT
        const { javascriptSandbox } = await deps();

        // Exercise
        const result = await javascriptSandbox.executeSyncFunction(
          {
            source: "",
            compiled: `
              export default function add(a, b) {
                return a + b;
              }
            `,
          },
          [1, 1],
        );

        // Verify
        assert(result.success);
        expect(result.data).toEqual(2);
      });

      it("composite arguments, composite return value", async () => {
        // Setup SUT
        const { javascriptSandbox } = await deps();

        // Exercise
        const result = await javascriptSandbox.executeSyncFunction(
          {
            source: "",
            compiled: `
              export default function add(a, b) {
                return { value: a.value + b.value };
              }
            `,
          },
          [{ value: 1 }, { value: 1 }],
        );

        // Verify
        assert(result.success);
        expect(result.data).toEqual({ value: 2 });
      });
    });
  });
});
