import { registerTypescriptCompilerTests } from "@superego/executing-backend/tests";
import { getMonacoTypescriptCompilerOptions } from "@superego/shared-utils";
import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker.js?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker.js?worker";
import MonacoTypescriptCompiler from "./MonacoTypescriptCompiler.js";

(self as any).MonacoEnvironment = {
  getWorker(_: any, label: string) {
    if (label === "typescript" || label === "javascript") {
      return new tsWorker();
    }
    return new editorWorker();
  },
};
monaco.typescript.typescriptDefaults.setEagerModelSync(true);
monaco.typescript.typescriptDefaults.setCompilerOptions(
  getMonacoTypescriptCompilerOptions(monaco.typescript),
);

registerTypescriptCompilerTests(() => {
  const typescriptCompiler = new MonacoTypescriptCompiler(async () => monaco);
  return { typescriptCompiler };
});
