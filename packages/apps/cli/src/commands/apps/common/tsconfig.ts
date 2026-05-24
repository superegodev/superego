import { typescriptTsconfigCompilerOptions } from "@superego/shared-utils";

export default {
  compilerOptions: typescriptTsconfigCompilerOptions,
  include: ["main.tsx", "Collection_*.ts", "node_modules/**/*.d.ts"],
};
