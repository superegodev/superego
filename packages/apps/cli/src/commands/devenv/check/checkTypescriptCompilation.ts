import { readFileSync } from "node:fs";
import type { TypescriptFile } from "@superego/backend";
import { TscTypescriptCompiler } from "@superego/tsc-typescript-compiler";
import type CheckResult from "./CheckResult.js";

export default async function checkTypescriptCompilation(
  target: string,
  filePath: string,
  mainPath: `/${string}.ts` | `/${string}.tsx`,
  libs: TypescriptFile[],
): Promise<CheckResult> {
  const mainFile: TypescriptFile = {
    path: mainPath,
    source: readFileSync(filePath, "utf-8"),
  };
  const result = await new TscTypescriptCompiler().compile(mainFile, libs);

  if (result.success) {
    return { target: target, success: true };
  }

  if (result.error.name === "TypescriptCompilationFailed") {
    return {
      target: target,
      success: false,
      errors: [
        result.error.details.reason === "TypeErrors"
          ? result.error.details.errors
          : "Missing output after compilation",
      ],
    };
  }

  return {
    target: target,
    success: false,
    errors: [`Unexpected error: ${JSON.stringify(result.error.details)}`],
  };
}
