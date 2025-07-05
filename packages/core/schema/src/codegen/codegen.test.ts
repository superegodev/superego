import { readdirSync } from "node:fs";
import * as ts from "typescript";
import * as v from "valibot";
import { describe, expect, it } from "vitest";
import schema from "../valibot-schemas/schema/schema.js";
import codegen from "./codegen.js";

describe("generates TypeScript from a schema", () => {
  const testSchemasDir = `${__dirname}/test-schemas`;
  const schemaExtension = ".schema.ts";
  const generatedExtension = ".generated.ts";
  it.each(
    readdirSync(testSchemasDir).filter((file) =>
      file.endsWith(schemaExtension),
    ),
  )("case: %s", async (schemaFile) => {
    // Setup
    const schemaName = schemaFile.replace(schemaExtension, "");
    const { default: testSchema } = await import(
      `${testSchemasDir}/${schemaFile}`
    );
    // Ensure that the test schema is valid.
    expect(v.is(schema(), testSchema)).toEqual(true);

    // Exercise
    const code = codegen(testSchema);

    // Verify
    expect(getCompilationErrors(code)).toEqual([]);
    await expect(code).toMatchFileSnapshot(
      `${testSchemasDir}/${schemaName}${generatedExtension}`,
    );
  });

  function getCompilationErrors(code: string): string[] {
    const fileName = "output.ts";

    const compilerOptions: ts.CompilerOptions = {
      noEmit: true,
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      strict: true,
      allowUnusedLabels: false,
      allowUnreachableCode: false,
      exactOptionalPropertyTypes: true,
      noFallthroughCasesInSwitch: true,
      noImplicitOverride: true,
      noImplicitReturns: true,
      noPropertyAccessFromIndexSignature: true,
      noUncheckedIndexedAccess: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      skipLibCheck: true,
    };

    const compilerHost = ts.createCompilerHost(compilerOptions, true);
    const originalReadFile = compilerHost.readFile;
    compilerHost.readFile = (path) => {
      if (path === fileName) {
        return code;
      }
      return originalReadFile(path);
    };
    compilerHost.writeFile = () => {};

    const program = ts.createProgram([fileName], compilerOptions, compilerHost);

    const diagnostics = [
      ...ts.getPreEmitDiagnostics(program),
      ...program.emit().diagnostics,
    ];

    return diagnostics.map((diagnostic) =>
      ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
    );
  }
});
