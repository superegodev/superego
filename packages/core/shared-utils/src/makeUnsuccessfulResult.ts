import type { Result, ResultError } from "@superego/global-types";

export default function makeUnsuccessfulResult<
  const Error extends ResultError<any, any>,
>(error: Error): Result<any, Error> & { success: false } {
  return { success: false, data: null, error: error };
}
