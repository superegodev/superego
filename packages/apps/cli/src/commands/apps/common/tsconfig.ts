import { typescriptTsconfigCompilerOptions } from "@superego/shared-utils";

const tsconfig = {
  compilerOptions: typescriptTsconfigCompilerOptions,
  include: ["main.tsx", "Collection_*.ts", "node_modules/**/*.d.ts"],
};

export default tsconfig;
