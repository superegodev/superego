import type { ExecutingTypescriptFunctionFailed } from "@superego/backend";
import type TypescriptSandbox from "../requirements/TypescriptSandbox.js";
import makeResultError from "./makeResultError.js";

export default function makeExecutingTypescriptFunctionFailed(
  error: TypescriptSandbox.ExecutingFunctionFailed,
): ExecutingTypescriptFunctionFailed {
  return makeResultError("ExecutingTypescriptFunctionFailed", error.details);
}
