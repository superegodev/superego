import type {
  TypescriptCompilationFailed,
  TypescriptFile,
  UnexpectedError,
} from "@superego/backend";
import type { TypescriptCompiler } from "@superego/executing-backend";
import type { ResultPromise } from "@superego/global-types";
import {
  extractErrorDetails,
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import * as tsvfs from "@typescript/vfs";
import ts from "typescript";

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

      const compilerOptions: ts.CompilerOptions = {
        noEmit: false,
        sourceMap: false,
        declaration: false,
        declarationMap: false,
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        strict: true,
        allowUnusedLabels: false,
        allowUnreachableCode: false,
        allowSyntheticDefaultImports: true,
        exactOptionalPropertyTypes: true,
        noFallthroughCasesInSwitch: true,
        noImplicitOverride: true,
        noImplicitReturns: true,
        noPropertyAccessFromIndexSignature: true,
        noUncheckedIndexedAccess: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        skipLibCheck: true,
        jsx: ts.JsxEmit.React,
      };
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
            errors: diagnostics.map((diagnostic) => {
              const message = ts.flattenDiagnosticMessageText(
                diagnostic.messageText,
                "\n",
              );
              if (diagnostic.file && diagnostic.start !== undefined) {
                const { line, character } =
                  diagnostic.file.getLineAndCharacterOfPosition(
                    diagnostic.start,
                  );
                return { message, line: line + 1, character: character + 1 };
              }
              return { message };
            }),
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
