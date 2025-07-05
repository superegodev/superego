import type { RpcError, RpcResult } from "@superego/backend";

export default function makeUnsuccessfulRpcResult<
  Error extends RpcError<any, any>,
>(error: Error): RpcResult<any, Error> {
  return { success: false, data: null, error: error };
}
