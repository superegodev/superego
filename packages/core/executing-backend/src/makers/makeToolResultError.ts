import type { ToolResultError } from "@superego/backend";

export default function makeToolResultError(
  name: string,
  details: any = null,
): ToolResultError {
  return { name, details };
}
