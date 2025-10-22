import type { TypescriptFile, UnexpectedError } from "@superego/backend";
import type { TypescriptCompiler } from "@superego/executing-backend";
import type { ResultPromise } from "@superego/global-types";
import {
  extractErrorDetails,
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import type * as monaco from "monaco-editor";
import flattenDiagnosticMessageText from "./flattenDiagnosticMessageText.js";

export default class MonacoTypescriptCompiler implements TypescriptCompiler {
  constructor(private getMonaco: () => Promise<typeof monaco>) {}

  async compile(
    main: TypescriptFile,
    libs: TypescriptFile[],
  ): ResultPromise<
    string,
    | TypescriptCompiler.TypeErrors
    | TypescriptCompiler.MissingOutput
    | UnexpectedError
  > {
    const monaco = await this.getMonaco();

    const basePath = crypto.randomUUID();
    const mainModel = monaco.editor.createModel(
      main.source,
      "typescript",
      monaco.Uri.parse(`vfs:/${basePath}${main.path}`),
    );
    const libModels = libs.map((lib) =>
      monaco.editor.createModel(
        lib.source,
        "typescript",
        monaco.Uri.parse(`vfs:/${basePath}${lib.path}`),
      ),
    );
    try {
      const worker = await monaco.languages.typescript
        .getTypeScriptWorker()
        .catch((error) => {
          // Sometimes the first call to `getTypeScriptWorker` fails with the
          // error below (actually string, not an Error object). It's not clear
          // why. The second attempt seems to work, so here we retry once.
          if (error === "TypeScript not registered!") {
            return monaco.languages.typescript.getTypeScriptWorker();
          }
          throw error;
        })
        .then((getter) => getter());

      const emitResult = await worker.getEmitOutput(mainModel.uri.toString());
      const mainOutputPath = mainModel.uri.toString().replace(/\.tsx?$/, ".js");
      const compiledCode = emitResult.outputFiles.find(
        (file) => file.name === mainOutputPath,
      )?.text;

      const diagnostics = (
        await Promise.all([
          worker.getSyntacticDiagnostics(mainModel.uri.toString()),
          worker.getSemanticDiagnostics(mainModel.uri.toString()),
          emitResult.diagnostics ?? [],
        ])
      ).flat();

      if (diagnostics.length !== 0) {
        return makeUnsuccessfulResult({
          name: "TypeErrors",
          details: {
            errors: diagnostics.map((diagnostic) => {
              const message = flattenDiagnosticMessageText(
                diagnostic.messageText,
              );
              if (diagnostic.start !== undefined && mainModel) {
                const { lineNumber, column } = mainModel.getPositionAt(
                  diagnostic.start,
                );
                return { message, line: lineNumber, character: column };
              }
              return { message };
            }),
          },
        });
      }

      if (!compiledCode) {
        return makeUnsuccessfulResult({
          name: "MissingOutput",
          details: {
            message: "Compilation didn't produce any output.",
          },
        });
      }

      return makeSuccessfulResult(compiledCode);
    } catch (error) {
      return makeUnsuccessfulResult({
        name: "UnexpectedError",
        details: { cause: extractErrorDetails(error) },
      });
    } finally {
      mainModel.dispose();
      for (const libModel of libModels) {
        libModel.dispose();
      }
    }
  }
}
