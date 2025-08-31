import type { Result } from "@superego/global-types";

export default function makeSuccessfulResult<Data>(
  data: Data,
): Result<Data, any> {
  return { success: true, data: data, error: null };
}
