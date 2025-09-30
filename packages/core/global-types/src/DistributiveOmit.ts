/**
 * Version of Omit that works with union types. See
 * https://github.com/microsoft/TypeScript/issues/28339 for details.
 */
type DistributiveOmit<T, K extends PropertyKey> = T extends any
  ? Omit<T, Extract<keyof T, K>>
  : never;
export default DistributiveOmit;
