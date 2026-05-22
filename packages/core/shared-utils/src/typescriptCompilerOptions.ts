import type ts from "typescript";

export const typescriptTsconfigCompilerOptions = {
  // Emit
  noEmit: false,
  sourceMap: false,
  declaration: false,
  declarationMap: false,

  // Modules
  module: "ESNext",
  moduleResolution: "Bundler",

  // Interop constraints
  allowSyntheticDefaultImports: true,

  // Language and environment
  target: "ESNext",
  jsx: "react",

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
} as const;

export function getTypescriptCompilerOptions(
  typescript: typeof ts,
): ts.CompilerOptions {
  const result = typescript.convertCompilerOptionsFromJson(
    typescriptTsconfigCompilerOptions,
    "/",
  );
  if (result.errors.length !== 0) {
    throw new Error(
      result.errors
        .map((diagnostic) =>
          typescript.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
        )
        .join("\n"),
    );
  }
  return result.options;
}

type MonacoTypescriptNamespace = {
  ModuleKind: { ESNext: number };
  ModuleResolutionKind: { NodeJs: number };
  ScriptTarget: { ESNext: number };
  JsxEmit: { React: number };
};

export function getMonacoTypescriptCompilerOptions(
  monacoTypescript: MonacoTypescriptNamespace,
) {
  return {
    ...typescriptTsconfigCompilerOptions,
    module: monacoTypescript.ModuleKind.ESNext,
    // Monaco 0.55 only exposes Classic and NodeJs module resolution.
    moduleResolution: monacoTypescript.ModuleResolutionKind.NodeJs,
    target: monacoTypescript.ScriptTarget.ESNext,
    jsx: monacoTypescript.JsxEmit.React,
  };
}
