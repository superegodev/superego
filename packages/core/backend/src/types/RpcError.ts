// TODO: make global shared types Error, Result, ResultPromise. They'll replace
// Rpc* etc and ToolResult*
export default interface RpcError<Name extends string, Details = null> {
  name: Name;
  details: Details;
}
