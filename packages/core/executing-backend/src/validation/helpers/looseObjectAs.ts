import * as v from "valibot";

/**
 * A boundary-shape schema for a complex object type. Validates only that the
 * value is an object — deep semantic validation is left to the usecase, which
 * surfaces precise domain errors. Use this in `argumentsSchema` for arguments
 * that are domain objects whose contents are validated semantically inside
 * the usecase (e.g. `CollectionDefinition`, `AppDefinition`).
 */
export default function looseObjectAs<T>(): v.GenericSchema<unknown, T> {
  return v.looseObject({}) as unknown as v.GenericSchema<unknown, T>;
}
