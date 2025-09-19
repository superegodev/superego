import type { Result } from "@superego/global-types";

export default function makeSuccessfulResult<Data>(
  data: Data,
): Result<Data, any> & { success: true } {
  return { success: true, data: data, error: null };
}
