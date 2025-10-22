import type TypescriptCompiler from "../TypescriptCompiler.js";

type GetDependencies = () => {
  typescriptCompiler: TypescriptCompiler;
};
export default GetDependencies;
