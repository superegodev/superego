import type { RpcResult } from "@superego/backend";

export default function makeSuccessfulRpcResult<Data>(
  data: Data,
): RpcResult<Data, any> {
  return { success: true, data: data, error: null };
}
