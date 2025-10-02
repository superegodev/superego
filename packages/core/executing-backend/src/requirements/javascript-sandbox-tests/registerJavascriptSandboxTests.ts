import type GetDependencies from "./GetDependencies.js";
import executeSyncFunction from "./suites/executeSyncFunction.js";
import moduleDefaultExportsFunction from "./suites/moduleDefaultExportsFunction.js";

export default function registerJavascriptSandboxTests(
  deps: GetDependencies,
  testsToSkip?: string[],
) {
  executeSyncFunction(deps, testsToSkip);
  moduleDefaultExportsFunction(deps, testsToSkip);
}
