import { typescriptTsconfigCompilerOptions } from "@superego/shared-utils";

export default {
  compilerOptions: typescriptTsconfigCompilerOptions,
  include: [
    "main.tsx",
    "app-state.ts",
    "state.migration.ts",
    "Collection_*.ts",
    "node_modules/**/*.d.ts",
  ],
};
