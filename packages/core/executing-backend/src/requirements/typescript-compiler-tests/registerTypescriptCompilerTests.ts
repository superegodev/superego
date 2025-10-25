import type GetDependencies from "./GetDependencies.js";
import compile from "./suites/compile.js";

export default function registerTypescriptCompilerTests(deps: GetDependencies) {
  compile(deps);
}
