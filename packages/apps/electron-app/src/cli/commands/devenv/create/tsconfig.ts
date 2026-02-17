export default function getTsconfigJson(): object {
  return {
    compilerOptions: {
      // Emit
      noEmit: false,
      sourceMap: false,
      declaration: false,
      declarationMap: false,

      // Modules
      module: "ESNext",
      moduleResolution: "Node",

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
    },
  };
}
