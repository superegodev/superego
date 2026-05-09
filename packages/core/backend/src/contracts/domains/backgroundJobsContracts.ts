import * as v from "valibot";
import ArgumentsNotValidSchema from "../../errors/ArgumentsNotValid.js";
import BackgroundJobNotFoundSchema from "../../errors/BackgroundJobNotFound.js";
import UnexpectedErrorSchema from "../../errors/UnexpectedError.js";
import BackgroundJobIdSchema from "../../ids/BackgroundJobId.js";
import BackgroundJobSchema from "../../types/BackgroundJob.js";
import LiteBackgroundJobSchema from "../../types/LiteBackgroundJob.js";

export const backgroundJobsContracts = {
  list: {
    argumentsSchema: v.tuple([]),
    dataSchema: v.array(LiteBackgroundJobSchema),
    errorSchemas: [ArgumentsNotValidSchema, UnexpectedErrorSchema],
  },
  get: {
    argumentsSchema: v.tuple([BackgroundJobIdSchema]),
    dataSchema: BackgroundJobSchema,
    errorSchemas: [
      ArgumentsNotValidSchema,
      BackgroundJobNotFoundSchema,
      UnexpectedErrorSchema,
    ],
  },
} as const;
