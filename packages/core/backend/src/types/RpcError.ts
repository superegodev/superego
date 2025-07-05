export default interface RpcError<Name extends string, Details = null> {
  name: Name;
  details: Details;
}
