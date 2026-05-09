import * as v from "valibot";

/**
 * Schema factory for a non-empty array. Use as `nonEmptyArraySchema(itemSchema)`.
 */
export function nonEmptyArraySchema<Item extends v.GenericSchema>(
  itemSchema: Item,
): v.GenericSchema<NonEmptyArray<v.InferOutput<Item>>> {
  return v.pipe(v.array(itemSchema), v.minLength(1)) as any;
}

type NonEmptyArray<Element> = [Element, ...Element[]];
export default NonEmptyArray;
