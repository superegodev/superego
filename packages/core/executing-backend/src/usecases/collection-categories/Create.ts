import type {
  Backend,
  CollectionCategory,
  CollectionCategoryDefinition,
  CollectionCategoryIconNotValid,
  CollectionCategoryId,
  CollectionCategoryNameNotValid,
  ParentCollectionCategoryNotFound,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  Id,
  makeSuccessfulResult,
  makeUnsuccessfulResult,
  valibotSchemas,
} from "@superego/shared-utils";
import * as v from "valibot";
import type CollectionCategoryEntity from "../../entities/CollectionCategoryEntity.js";
import makeCollectionCategory from "../../makers/makeCollectionCategory.js";
import makeResultError from "../../makers/makeResultError.js";
import makeValidationIssues from "../../makers/makeValidationIssues.js";
import * as argSchemas from "../../utils/argSchemas.js";
import Usecase from "../../utils/Usecase.js";
import validateArgs from "../../utils/validateArgs.js";

interface CollectionCategoriesCreateOptions {
  collectionCategoryId?: CollectionCategoryId;
  skipReferenceCheckForCollectionCategoryIds?: CollectionCategoryId[];
}

const collectionCategoriesCreateOptionsSchema = v.strictObject({
  collectionCategoryId: v.optional(valibotSchemas.id.collectionCategory()),
  skipReferenceCheckForCollectionCategoryIds: v.optional(
    v.array(valibotSchemas.id.collectionCategory()),
  ),
});

export default class CollectionCategoriesCreate extends Usecase<
  Backend["collectionCategories"]["create"]
> {
  @validateArgs([
    argSchemas.collectionCategoryDefinition(),
    collectionCategoriesCreateOptionsSchema,
  ])
  async exec(
    definition: CollectionCategoryDefinition,
    options: CollectionCategoriesCreateOptions = {},
  ): ResultPromise<
    CollectionCategory,
    | CollectionCategoryNameNotValid
    | CollectionCategoryIconNotValid
    | ParentCollectionCategoryNotFound
    | UnexpectedError
  > {
    const nameValidationResult = v.safeParse(
      valibotSchemas.collectionCategoryName(),
      definition.name,
    );

    if (!nameValidationResult.success) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionCategoryNameNotValid", {
          collectionCategoryId: null,
          issues: makeValidationIssues(nameValidationResult.issues),
        }),
      );
    }

    const iconValidationResult = v.safeParse(
      v.nullable(valibotSchemas.icon()),
      definition.icon,
    );

    if (!iconValidationResult.success) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionCategoryIconNotValid", {
          collectionCategoryId: null,
          issues: makeValidationIssues(iconValidationResult.issues),
        }),
      );
    }

    if (
      definition.parentId &&
      !options.skipReferenceCheckForCollectionCategoryIds?.includes(
        definition.parentId,
      ) &&
      !(await this.repos.collectionCategory.exists(definition.parentId))
    ) {
      return makeUnsuccessfulResult(
        makeResultError("ParentCollectionCategoryNotFound", {
          parentId: definition.parentId,
        }),
      );
    }

    const collectionCategory: CollectionCategoryEntity = {
      id: options.collectionCategoryId ?? Id.generate.collectionCategory(),
      name: nameValidationResult.output,
      icon: iconValidationResult.output,
      parentId: definition.parentId,
      createdAt: new Date(),
    };
    await this.repos.collectionCategory.insert(collectionCategory);

    return makeSuccessfulResult(makeCollectionCategory(collectionCategory));
  }
}
