import type RpcError from "../types/RpcError.js";

type UnexpectedError = RpcError<
  "UnexpectedError",
  {
    cause: any;
  }
>;
export default UnexpectedError;
