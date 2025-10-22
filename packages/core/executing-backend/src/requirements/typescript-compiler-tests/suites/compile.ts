import type {
  TypescriptCompilationFailed,
  TypescriptFile,
} from "@superego/backend";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { assert, expect, it } from "vitest";
import type GetDependencies from "../GetDependencies.js";

export default rd<GetDependencies>("compile", (deps) => {
  type TestCase = {
    name: string;
    source: string;
    libs?: TypescriptFile[];
  } & (
    | {
        expectedTypeErrors: Exclude<
          TypescriptCompilationFailed["details"],
          { reason: "MissingOutput" }
        >["errors"];
      }
    | { expectedCompiled: string }
  );
  const testCases: TestCase[] = [
    {
      name: "error: syntax errors",
      source: `
        export default function a() {
          if (true {}
        }
      `,
      expectedTypeErrors: [
        {
          message: "')' expected.",
          line: 2,
          character: 12,
        },
      ],
    },
    {
      name: "error: type errors (case: w/o libs)",
      source: `
        export default function a(): string {
          return null;
        }
      `,
      expectedTypeErrors: [
        {
          message: "Type 'null' is not assignable to type 'string'.",
          line: 2,
          character: 3,
        },
      ],
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
      expectedTypeErrors: [
        {
          message: "Type 'null' is not assignable to type 'string'.",
          line: 4,
          character: 3,
        },
      ],
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
            errors: testCase.expectedTypeErrors,
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
