/**
 * Version of Pick that works with union types. See
 * https://github.com/microsoft/TypeScript/issues/28339 for details.
 */
type DistributivePick<T, K extends keyof T> = T extends unknown
  ? Pick<T, K>
  : never;
export default DistributivePick;
