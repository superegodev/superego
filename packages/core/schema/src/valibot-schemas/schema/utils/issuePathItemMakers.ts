import type * as v from "valibot";

export function makeObjectPathItem<Key extends string>(
  input: { [key in Key]?: unknown },
  key: Key,
): v.ObjectPathItem {
  return {
    type: "object",
    origin: "value",
    input: input,
    key: key,
    value: input[key],
  };
}

export function makeArrayPathItem(
  input: unknown[],
  key: number,
): v.ArrayPathItem {
  return {
    type: "array",
    origin: "value",
    input: input,
    key: key,
    value: input[key],
  };
}
