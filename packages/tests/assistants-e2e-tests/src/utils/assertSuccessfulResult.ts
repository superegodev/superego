import type { Result, ResultError } from "@superego/global-types";
import { assert } from "vitest";

export default function assertSuccessfulResult<
  TResult extends Result<any, ResultError<any, any>>,
>(
  message: string,
  result: TResult,
): asserts result is TResult & { success: true } {
  assert.equal(result.error, null, message);
}
