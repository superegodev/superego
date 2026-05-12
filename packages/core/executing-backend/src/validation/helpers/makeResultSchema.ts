import type { Result, ResultError } from "@superego/global-types";
import * as v from "valibot";

/**
 * Composes a valibot schema for a `Result<Data, Error>` envelope, given a
 * schema for the success `data` and one schema per possible error.
 */
export default function makeResultSchema<
  Data,
  ErrorSchemas extends readonly v.GenericSchema<
    unknown,
    ResultError<string, any>
  >[],
>(
  dataSchema: v.GenericSchema<unknown, Data>,
  errorSchemas: ErrorSchemas,
): v.GenericSchema<unknown, Result<Data, v.InferOutput<ErrorSchemas[number]>>> {
  const errorSchema =
    errorSchemas.length === 1 ? errorSchemas[0]! : v.union([...errorSchemas]);
  return v.union([
    v.strictObject({
      success: v.literal(true),
      data: dataSchema,
      error: v.null(),
    }),
    v.strictObject({
      success: v.literal(false),
      data: v.null(),
      error: errorSchema,
    }),
  ]) as v.GenericSchema<
    unknown,
    Result<Data, v.InferOutput<ErrorSchemas[number]>>
  >;
}
