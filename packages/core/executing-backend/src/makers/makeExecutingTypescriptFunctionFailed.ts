import type { ExecutingTypescriptFunctionFailed } from "@superego/backend";
import type JavascriptSandbox from "../requirements/JavascriptSandbox.js";
import makeResultError from "./makeResultError.js";

export default function makeExecutingTypescriptFunctionFailed(
  error: JavascriptSandbox.ExecutingFunctionFailed,
): ExecutingTypescriptFunctionFailed {
  return makeResultError("ExecutingTypescriptFunctionFailed", error.details);
}
