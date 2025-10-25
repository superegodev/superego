import { registerTypescriptCompilerTests } from "@superego/executing-backend/tests";
import TscTypescriptCompiler from "./TscTypescriptCompiler.js";

registerTypescriptCompilerTests(() => {
  const typescriptCompiler = new TscTypescriptCompiler();
  return { typescriptCompiler };
});
