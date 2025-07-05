import type UnexpectedError from "../errors/UnexpectedError.js";
import type RpcError from "./RpcError.js";

type RpcResult<Data, Error extends RpcError<any, any> = UnexpectedError> =
  | { success: true; data: Data; error: null }
  | { success: false; data: null; error: Error | UnexpectedError };
export default RpcResult;
