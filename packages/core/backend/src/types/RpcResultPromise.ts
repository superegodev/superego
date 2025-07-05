import type UnexpectedError from "../errors/UnexpectedError.js";
import type RpcError from "./RpcError.js";
import type RpcResult from "./RpcResult.js";

type RpcResultPromise<
  Data,
  Error extends RpcError<any, any> = UnexpectedError,
> = Promise<RpcResult<Data, Error>>;
export default RpcResultPromise;
