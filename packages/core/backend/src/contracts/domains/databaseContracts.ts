import * as v from "valibot";
import ArgumentsNotValidSchema from "../../errors/ArgumentsNotValid.js";
import UnexpectedErrorSchema from "../../errors/UnexpectedError.js";

export const databaseContracts = {
  export: {
    argumentsSchema: v.tuple([v.string()]),
    dataSchema: v.null(),
    errorSchemas: [ArgumentsNotValidSchema, UnexpectedErrorSchema],
  },
} as const;
