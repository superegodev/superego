import type { TypescriptFile } from "@superego/backend";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { assert, expect, it } from "vitest";
import type GetDependencies from "../GetDependencies.js";

export default rd<GetDependencies>("compile", (deps) => {
  type TestCase = {
    name: string;
    source: string;
    libs?: TypescriptFile[];
  } & ({ expectedTypeErrors: string } | { expectedCompiled: string });
  const testCases: TestCase[] = [
    {
      name: "error: syntax errors",
      source: `
        export default function a() {
          if (true {}
        }
      `,
      expectedTypeErrors: "/main.ts:2:12 error TS1005: ')' expected.",
    },
    {
      name: "error: type errors (case: w/o libs)",
      source: `
        export default function a(): string {
          return null;
        }
      `,
      expectedTypeErrors:
        "/main.ts:2:3 error TS2322: Type 'null' is not assignable to type 'string'.",
    },
    {
      name: "error: type errors (case: w/ libs)",
      source: `
        import type { A } from "./lib.js";

        export default function a(): A {
          return null;
        }
      `,
      libs: [
        {
          path: "/lib.ts",
          source: `
            export type A = string;
          `,
        },
      ],
      expectedTypeErrors:
        "/main.ts:4:3 error TS2322: Type 'null' is not assignable to type 'string'.",
    },
    {
      name: "error: complex type errors",
      source: `
        export default function a(): () => string {
          return () => Math.random() > 0.5 ? "string" : undefined;
        }
      `,
      expectedTypeErrors: `
        /main.ts:2:16 error TS2322: Type 'string | undefined' is not assignable to type 'string'.
            Type 'undefined' is not assignable to type 'string'.
      `,
    },
    {
      name: "success (case: w/o libs)",
      source: `
        export default function a(): string {
          return "a";
        }
      `,
      expectedCompiled: `
        export default function a() {
            return "a";
        }
      `,
    },
    {
      name: "success (case: w/ libs)",
      source: `
        import type { A } from "./lib.js";

        export default function a(): A {
          return "a";
        }
      `,
      libs: [
        {
          path: "/lib.ts",
          source: `
            export type A = string;
          `,
        },
      ],
      expectedCompiled: `
        export default function a() {
            return "a";
        }
      `,
    },
    {
      name: "success (case: accessing globally-declared properties)",
      source: `
        export default function a(): string {
          return globalProperty;
        }
      `,
      libs: [
        {
          path: "/globalLib.d.ts",
          source: `
            export {};

            declare global {
              var globalProperty: string;
            }
          `,
        },
      ],
      expectedCompiled: `
        export default function a() {
            return globalProperty;
        }
      `,
    },
    {
      name: "success (case: accessing globally-declared properties via globalThis)",
      source: `
        export default function a(): string {
          return globalThis.globalProperty;
        }
      `,
      libs: [
        {
          path: "/globalLib.d.ts",
          source: `
            export {};

            declare global {
              var globalProperty: string;
            }
          `,
        },
      ],
      expectedCompiled: `
        export default function a() {
            return globalThis.globalProperty;
        }
      `,
    },
  ];

  it.each(testCases)("$name", async (testCase) => {
    // Setup SUT
    const { typescriptCompiler } = deps();

    // Exercise
    const result = await typescriptCompiler.compile(
      { path: "/main.ts", source: stripIndent(testCase.source) },
      testCase.libs ?? [],
    );

    // Verify
    if ("expectedTypeErrors" in testCase) {
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "TypescriptCompilationFailed",
          details: {
            reason: "TypeErrors",
            errors: stripIndent(testCase.expectedTypeErrors),
          },
        },
      });
    } else {
      assert(result.success);
      expect(result.data.trim()).toEqual(
        stripIndent(testCase.expectedCompiled),
      );
    }
  });
});

function stripIndent(code: string): string {
  const lines = code.split("\n");
  const firstNonEmptyLine = lines.find((line) => line !== "");
  if (!firstNonEmptyLine) {
    return code.trim();
  }
  const leadingWhitespaceMatch = firstNonEmptyLine.match(/^ +/);
  if (!leadingWhitespaceMatch) {
    return code.trim();
  }
  const indent = leadingWhitespaceMatch[0];
  return lines
    .map((line) => line.replace(new RegExp(`^${indent}`), ""))
    .join("\n")
    .trim();
}
