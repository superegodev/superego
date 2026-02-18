import typescriptLibs from "@superego/app-sandbox/typescript-libs";
import type { TypescriptFile } from "@superego/backend";
import { TscTypescriptCompiler } from "@superego/tsc-typescript-compiler";

const compiler = new TscTypescriptCompiler();

export default async function compileTypescriptFile(
  main: TypescriptFile,
  additionalLibs: TypescriptFile[] = [],
): Promise<
  { success: true; compiled: string } | { success: false; errors: string }
> {
  const result = await compiler.compile(main, [
    ...typescriptLibs,
    ...additionalLibs,
  ]);
  if (result.success) {
    return { success: true, compiled: result.data };
  }
  if (result.error.name === "TypescriptCompilationFailed") {
    return {
      success: false,
      errors:
        result.error.details.reason === "TypeErrors"
          ? result.error.details.errors
          : "Missing output after compilation",
    };
  }
  return {
    success: false,
    errors: `Unexpected error: ${JSON.stringify(result.error.details)}`,
  };
}
