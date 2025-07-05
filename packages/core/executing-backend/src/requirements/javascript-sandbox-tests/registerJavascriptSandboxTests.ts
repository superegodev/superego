import type Dependencies from "./Dependencies.js";
import executeSyncFunction from "./suites/executeSyncFunction.js";
import moduleDefaultExportsFunction from "./suites/moduleDefaultExportsFunction.js";

export type { default as Dependencies } from "./Dependencies.js";

export default function registerJavascriptSandboxTests(
  deps: () => Promise<Dependencies>,
  testsToSkip?: string[],
) {
  executeSyncFunction(deps, testsToSkip);
  moduleDefaultExportsFunction(deps, testsToSkip);
}
