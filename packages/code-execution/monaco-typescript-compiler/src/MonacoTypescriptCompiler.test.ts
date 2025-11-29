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
monaco.typescript.typescriptDefaults.setEagerModelSync(true);
monaco.typescript.typescriptDefaults.setCompilerOptions({
  // Emit
  noEmit: false,
  sourceMap: false,
  declaration: false,
  declarationMap: false,

  // Modules
  module: monaco.typescript.ModuleKind.ESNext,
  moduleResolution: monaco.typescript.ModuleResolutionKind.NodeJs,

  // Language and environment
  target: monaco.typescript.ScriptTarget.ESNext,
  jsx: monaco.typescript.JsxEmit.React,

  // Completeness
  skipLibCheck: true,

  // Type checking options
  allowUnreachableCode: false,
  allowUnusedLabels: false,
  alwaysStrict: true,
  exactOptionalPropertyTypes: false,
  noFallthroughCasesInSwitch: true,
  noImplicitAny: true,
  noImplicitOverride: false,
  noImplicitReturns: true,
  noImplicitThis: true,
  noPropertyAccessFromIndexSignature: false,
  noUncheckedIndexedAccess: false,
  noUnusedLocals: false,
  noUnusedParameters: false,
  strict: true,
  strictBindCallApply: true,
  strictBuiltinIteratorReturn: true,
  strictFunctionTypes: true,
  strictNullChecks: true,
  strictPropertyInitialization: true,
  useUnknownInCatchVariables: true,
});

registerTypescriptCompilerTests(() => {
  const typescriptCompiler = new MonacoTypescriptCompiler(async () => monaco);
  return { typescriptCompiler };
});
