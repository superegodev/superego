import type { ToolResultOutput } from "@superego/backend";

export default function makeSuccessfulToolResultOutput<Data>(
  data: Data,
): ToolResultOutput<Data, any> {
  return { success: true, data: data };
}
