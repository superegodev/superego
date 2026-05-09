import * as v from "valibot";
import ArgumentsNotValidSchema from "../../errors/ArgumentsNotValid.js";
import CollectionCategoryHasChildrenSchema from "../../errors/CollectionCategoryHasChildren.js";
import CollectionCategoryIconNotValidSchema from "../../errors/CollectionCategoryIconNotValid.js";
import CollectionCategoryNameNotValidSchema from "../../errors/CollectionCategoryNameNotValid.js";
import CollectionCategoryNotFoundSchema from "../../errors/CollectionCategoryNotFound.js";
import ParentCollectionCategoryIsDescendantSchema from "../../errors/ParentCollectionCategoryIsDescendant.js";
import ParentCollectionCategoryNotFoundSchema from "../../errors/ParentCollectionCategoryNotFound.js";
import UnexpectedErrorSchema from "../../errors/UnexpectedError.js";
import CollectionCategoryIdSchema from "../../ids/CollectionCategoryId.js";
import CollectionCategorySchema from "../../types/CollectionCategory.js";
import CollectionCategoryDefinitionSchema from "../../types/CollectionCategoryDefinition.js";

export const collectionCategoriesContracts = {
  create: {
    argumentsSchema: v.tuple([CollectionCategoryDefinitionSchema]),
    dataSchema: CollectionCategorySchema,
    errorSchemas: [
      ArgumentsNotValidSchema,
      CollectionCategoryNameNotValidSchema,
      CollectionCategoryIconNotValidSchema,
      ParentCollectionCategoryNotFoundSchema,
      UnexpectedErrorSchema,
    ],
  },
  update: {
    argumentsSchema: v.tuple([
      CollectionCategoryIdSchema,
      v.object({
        name: v.optional(v.string()),
        icon: v.optional(v.nullable(v.string())),
        parentId: v.optional(v.nullable(CollectionCategoryIdSchema)),
      }),
    ]),
    dataSchema: CollectionCategorySchema,
    errorSchemas: [
      ArgumentsNotValidSchema,
      CollectionCategoryNotFoundSchema,
      CollectionCategoryNameNotValidSchema,
      CollectionCategoryIconNotValidSchema,
      ParentCollectionCategoryNotFoundSchema,
      ParentCollectionCategoryIsDescendantSchema,
      UnexpectedErrorSchema,
    ],
  },
  delete: {
    argumentsSchema: v.tuple([CollectionCategoryIdSchema]),
    dataSchema: v.null(),
    errorSchemas: [
      ArgumentsNotValidSchema,
      CollectionCategoryNotFoundSchema,
      CollectionCategoryHasChildrenSchema,
      UnexpectedErrorSchema,
    ],
  },
  list: {
    argumentsSchema: v.tuple([]),
    dataSchema: v.array(CollectionCategorySchema),
    errorSchemas: [ArgumentsNotValidSchema, UnexpectedErrorSchema],
  },
} as const;
