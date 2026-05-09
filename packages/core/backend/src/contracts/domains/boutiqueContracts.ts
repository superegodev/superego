import * as v from "valibot";
import ArgumentsNotValidSchema from "../../errors/ArgumentsNotValid.js";
import PackNotFoundSchema from "../../errors/PackNotFound.js";
import UnexpectedErrorSchema from "../../errors/UnexpectedError.js";
import PackIdSchema from "../../ids/PackId.js";
import LitePackSchema from "../../types/LitePack.js";
import PackSchema from "../../types/Pack.js";

export const boutiqueContracts = {
  listPacks: {
    argumentsSchema: v.tuple([]),
    dataSchema: v.array(LitePackSchema),
    errorSchemas: [ArgumentsNotValidSchema, UnexpectedErrorSchema],
  },
  getPack: {
    argumentsSchema: v.tuple([PackIdSchema]),
    dataSchema: PackSchema,
    errorSchemas: [
      ArgumentsNotValidSchema,
      PackNotFoundSchema,
      UnexpectedErrorSchema,
    ],
  },
} as const;
