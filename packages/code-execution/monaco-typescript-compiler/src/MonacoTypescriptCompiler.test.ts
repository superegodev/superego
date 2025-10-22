import { registerTypescriptCompilerTests } from "@superego/executing-backend/tests";
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
monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  noEmit: false,
  sourceMap: false,
  declaration: false,
  declarationMap: false,
  target: monaco.languages.typescript.ScriptTarget.ESNext,
  module: monaco.languages.typescript.ModuleKind.ESNext,
  moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
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
  jsx: monaco.languages.typescript.JsxEmit.React,
});

registerTypescriptCompilerTests(() => {
  const typescriptCompiler = new MonacoTypescriptCompiler(async () => monaco);
  return { typescriptCompiler };
});
