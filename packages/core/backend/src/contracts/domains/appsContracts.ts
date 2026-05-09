import * as v from "valibot";
import AppNameNotValidSchema from "../../errors/AppNameNotValid.js";
import AppNotFoundSchema from "../../errors/AppNotFound.js";
import ArgumentsNotValidSchema from "../../errors/ArgumentsNotValid.js";
import CollectionNotFoundSchema from "../../errors/CollectionNotFound.js";
import CommandConfirmationNotValidSchema from "../../errors/CommandConfirmationNotValid.js";
import UnexpectedErrorSchema from "../../errors/UnexpectedError.js";
import AppIdSchema from "../../ids/AppId.js";
import CollectionIdSchema from "../../ids/CollectionId.js";
import AppSchema from "../../types/App.js";
import AppDefinitionSchema from "../../types/AppDefinition.js";
import TypescriptModuleSchema from "../../types/TypescriptModule.js";

export const appsContracts = {
  create: {
    argumentsSchema: v.tuple([AppDefinitionSchema]),
    dataSchema: AppSchema,
    errorSchemas: [
      ArgumentsNotValidSchema,
      AppNameNotValidSchema,
      CollectionNotFoundSchema,
      UnexpectedErrorSchema,
    ],
  },
  updateName: {
    argumentsSchema: v.tuple([AppIdSchema, v.string()]),
    dataSchema: AppSchema,
    errorSchemas: [
      ArgumentsNotValidSchema,
      AppNotFoundSchema,
      AppNameNotValidSchema,
      UnexpectedErrorSchema,
    ],
  },
  createNewVersion: {
    argumentsSchema: v.tuple([
      AppIdSchema,
      v.array(CollectionIdSchema),
      v.object({ "/main.tsx": TypescriptModuleSchema }),
    ]),
    dataSchema: AppSchema,
    errorSchemas: [
      ArgumentsNotValidSchema,
      AppNotFoundSchema,
      CollectionNotFoundSchema,
      UnexpectedErrorSchema,
    ],
  },
  delete: {
    argumentsSchema: v.tuple([AppIdSchema, v.string()]),
    dataSchema: v.null(),
    errorSchemas: [
      ArgumentsNotValidSchema,
      AppNotFoundSchema,
      CommandConfirmationNotValidSchema,
      UnexpectedErrorSchema,
    ],
  },
  list: {
    argumentsSchema: v.tuple([]),
    dataSchema: v.array(AppSchema),
    errorSchemas: [ArgumentsNotValidSchema, UnexpectedErrorSchema],
  },
} as const;
