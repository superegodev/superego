import { LocalInstant } from "@superego/javascript-sandbox-global-utils";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { assert, describe, expect } from "vitest";
import type GetDependencies from "../GetDependencies.js";

export default rd<GetDependencies>("executeSyncFunction", (deps, it) => {
  describe("executes the function default-exported by with the supplied module, with the supplied args, and returns the result", () => {
    describe("failed executions", () => {
      it("importing the module fails (syntax error)", async () => {
        // Setup SUT
        const { javascriptSandbox } = deps();

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
        const { javascriptSandbox } = deps();

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
        const { javascriptSandbox } = deps();

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
        const { javascriptSandbox } = deps();

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
        const { javascriptSandbox } = deps();

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
        const { javascriptSandbox } = deps();

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
        const { javascriptSandbox } = deps();

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
        const { javascriptSandbox } = deps();

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

  describe("gives the function access to global utils", () => {
    it("LocalInstant", async () => {
      // Setup SUT
      const { javascriptSandbox } = deps();

      // Exercise
      const result = await javascriptSandbox.executeSyncFunction(
        {
          source: "",
          compiled: `
            export default function localInstantTest() {
              let invalidISO = null;
              try {
                LocalInstant.fromISO("not-a-valid-iso");
              } catch (error) {
                invalidISO = error.message;
              }
              let invalidInstant = null;
              try {
                LocalInstant.fromInstant("not-a-valid-instant");
              } catch (error) {
                invalidInstant = error.message;
              }
              let invalidPlainDate = null;
              try {
                LocalInstant.fromPlainDate("not-a-valid-plain-date");
              } catch (error) {
                invalidPlainDate = error.message;
              }
              const localInstant = LocalInstant
                .fromISO("2025-08-12T16:06:00.000+03:00")
                .plus({ months: 5, days: 1 })
                .minus({ months: 1, weeks: 2 })
                .endOf("day")
                .startOf("week")
                .set({ hour: 1 });
              return {
                isSetOnGlobalThis: globalThis.LocalInstant === LocalInstant,
                invalidISO: invalidISO,
                invalidInstant: invalidInstant,
                invalidPlainDate: invalidPlainDate,
                iso: localInstant.toISO(),
                jsDate: localInstant.toJSDate().toISOString(),
                plainDate: localInstant.toPlainDate(),
                comparisonGt: localInstant.set({ hour: 2 }) > localInstant,
                comparisonGte: localInstant.set({ hour: 1 }) >= localInstant,
                comparisonLt: localInstant.set({ hour: 0 }) < localInstant,
                comparisonLte: localInstant.set({ hour: 1 }) <= localInstant,
                coercionToNumber: Number(localInstant),
                coercionToString: String(localInstant),
              };
            }
          `,
        },
        [],
      );

      // Verify
      assert(result.success);
      const expectedLocalInstant = LocalInstant.fromISO(
        "2025-08-12T16:06:00.000+03:00",
      )
        .plus({ months: 5, days: 1 })
        .minus({ months: 1, weeks: 2 })
        .endOf("day")
        .startOf("week")
        .set({ hour: 1 });
      expect(result.data).toEqual({
        isSetOnGlobalThis: true,
        invalidISO: '"not-a-valid-iso" is not a valid ISO 8601 string',
        invalidInstant:
          '"not-a-valid-instant" is not a valid dev.superego:String.Instant',
        invalidPlainDate:
          '"not-a-valid-plain-date" is not a valid dev.superego:String.PlainDate',
        iso: expectedLocalInstant.toISO(),
        jsDate: expectedLocalInstant.toJSDate().toISOString(),
        plainDate: expectedLocalInstant.toPlainDate(),
        comparisonGt: true,
        comparisonGte: true,
        comparisonLt: true,
        comparisonLte: true,
        coercionToNumber: expectedLocalInstant.toJSDate().getTime(),
        coercionToString: expectedLocalInstant.toISO(),
      });
    });
  });

  it("gives access to globalThis", async () => {
    // Setup SUT
    const { javascriptSandbox } = deps();

    // Exercise
    const result = await javascriptSandbox.executeSyncFunction(
      {
        source: "",
        compiled: `
          export default function canAccessGlobalThis() {
            return globalThis.Object === Object;
          }
        `,
      },
      [],
    );

    // Verify
    assert(result.success);
    expect(result.data).toEqual(true);
  });
});
