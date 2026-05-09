import * as v from "valibot";
import ArgumentsNotValidSchema from "../../errors/ArgumentsNotValid.js";
import FileNotFoundSchema from "../../errors/FileNotFound.js";
import UnexpectedErrorSchema from "../../errors/UnexpectedError.js";
import FileIdSchema from "../../ids/FileId.js";

export const filesContracts = {
  getContent: {
    argumentsSchema: v.tuple([FileIdSchema]),
    dataSchema: v.instance(Uint8Array),
    errorSchemas: [
      ArgumentsNotValidSchema,
      FileNotFoundSchema,
      UnexpectedErrorSchema,
    ],
  },
} as const;
