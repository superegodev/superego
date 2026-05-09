import * as v from "valibot";

/**
 * A schema describing a single ResultError variant: { name, details }. Used as
 * the element type of `Contract.errorSchemas`.
 */
export type ErrorSchema<Name extends string = string> = v.GenericSchema<{
  name: Name;
  details: any;
}>;

/**
 * Sugar for declaring an error schema. Mirrors the shape of `ResultError` from
 * @superego/global-types: `{ name, details }`.
 */
export function defineError<
  Name extends string,
  DetailsSchema extends v.GenericSchema,
>(
  name: Name,
  detailsSchema: DetailsSchema,
): v.GenericSchema<{ name: Name; details: v.InferOutput<DetailsSchema> }> {
  return v.object({
    name: v.literal(name),
    details: detailsSchema,
  }) as any;
}

/**
 * Builds the full Result envelope schema for a usecase output. Mirrors the
 * runtime shape declared in @superego/global-types/Result: `{ success, data,
 * error }` with both data and error always present (one of them null).
 */
export function makeResultSchema<
  DataSchema extends v.GenericSchema,
  ErrorSchemas extends readonly [ErrorSchema, ...ErrorSchema[]],
>(dataSchema: DataSchema, errorSchemas: ErrorSchemas) {
  const errorSchema =
    errorSchemas.length === 1
      ? errorSchemas[0]
      : v.union(errorSchemas as unknown as ErrorSchema[]);
  return v.union([
    v.object({
      success: v.literal(true),
      data: dataSchema,
      error: v.null(),
    }),
    v.object({
      success: v.literal(false),
      data: v.null(),
      error: errorSchema,
    }),
  ]);
}

/**
 * The contract for a single usecase: structural schemas for arguments, success
 * data, and the discriminated union of possible errors. Used to drive both
 * runtime validation (in ExecutingBackend.makeUsecase) and the derivation of
 * the Backend type.
 */
export interface Contract<
  ArgumentsSchema extends v.GenericSchema<readonly unknown[]> = v.GenericSchema<
    readonly unknown[]
  >,
  DataSchema extends v.GenericSchema = v.GenericSchema,
  ErrorSchemas extends readonly [ErrorSchema, ...ErrorSchema[]] = readonly [
    ErrorSchema,
    ...ErrorSchema[],
  ],
> {
  argumentsSchema: ArgumentsSchema;
  dataSchema: DataSchema;
  errorSchemas: ErrorSchemas;
}

type ContractsRegistry = {
  [domain: string]: { [method: string]: Contract };
};

/**
 * The result envelope inferred from a contract. Equivalent to `Result<Data,
 * Error>` from @superego/global-types but expressed in terms of the contract's
 * schemas.
 */
export type ResultOf<C extends Contract> =
  | {
      success: true;
      data: v.InferOutput<C["dataSchema"]>;
      error: null;
    }
  | {
      success: false;
      data: null;
      error: v.InferOutput<C["errorSchemas"][number]>;
    };

/**
 * Derives the Backend interface from a contracts registry. Each method's
 * arguments use `InferInput` (callers pass unbranded values; validation
 * narrows to the branded form). Each method's return uses `InferOutput`.
 */
export type DeriveBackend<R extends ContractsRegistry> = {
  [Domain in keyof R]: {
    [Method in keyof R[Domain]]: (
      ...args: Extract<
        v.InferInput<R[Domain][Method]["argumentsSchema"]>,
        readonly unknown[]
      >
    ) => Promise<ResultOf<R[Domain][Method]>>;
  };
};
