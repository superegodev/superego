import type { ToolResultError, ToolResultOutput } from "@superego/backend";

export default function makeUnsuccessfulToolResultOutput<
  Error extends ToolResultError<any, any>,
>(error: Error): ToolResultOutput<any, Error> {
  return { success: false, error: error };
}
