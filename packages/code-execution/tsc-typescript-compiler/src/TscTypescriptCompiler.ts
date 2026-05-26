import type {
  TypescriptCompilationFailed,
  TypescriptFile,
  UnexpectedError,
} from "@superego/backend";
import type { TypescriptCompiler } from "@superego/executing-backend";
import type { ResultPromise } from "@superego/global-types";
import {
  extractErrorDetails,
  getTypescriptCompilerOptions,
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import * as tsvfs from "@typescript/vfs";
import ts from "typescript";
import stringifyDiagnostic from "./stringifyDiagnostic.js";

export default class TscTypescriptCompiler implements TypescriptCompiler {
  async compile(
    main: TypescriptFile,
    libs: TypescriptFile[],
  ): ResultPromise<string, TypescriptCompilationFailed | UnexpectedError> {
    try {
      const fs = tsvfs.createDefaultMapFromNodeModules({
        target: ts.ScriptTarget.ESNext,
      });
      fs.set(main.path, main.source);
      for (const lib of libs) {
        fs.set(lib.path, lib.source);
      }

      const compilerOptions = getTypescriptCompilerOptions(ts);
      const program = ts.createProgram({
        rootNames: [...fs.keys()],
        options: compilerOptions,
        host: tsvfs.createVirtualCompilerHost(
          tsvfs.createSystem(fs),
          compilerOptions,
          ts,
        ).compilerHost,
      });
      const emitResult = program.emit();

      const diagnostics = [
        ...ts.getPreEmitDiagnostics(program),
        ...emitResult.diagnostics,
      ];
      if (diagnostics.length !== 0) {
        return makeUnsuccessfulResult({
          name: "TypescriptCompilationFailed",
          details: {
            reason: "TypeErrors",
            errors: diagnostics.map(stringifyDiagnostic).join("\n\n"),
          },
        });
      }

      const compiledCode = fs.get(main.path.replace(/\.tsx?$/, ".js"));
      if (!compiledCode) {
        return makeUnsuccessfulResult({
          name: "TypescriptCompilationFailed",
          details: {
            reason: "MissingOutput",
          },
        });
      }

      return makeSuccessfulResult(compiledCode);
    } catch (error) {
      return makeUnsuccessfulResult({
        name: "UnexpectedError",
        details: { cause: extractErrorDetails(error) },
      });
    }
  }
}
