import type {
  Backend,
  CollectionCategory,
  CollectionCategoryDefinition,
  CollectionCategoryIconNotValid,
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
import Usecase from "../../utils/Usecase.js";

export default class CollectionCategoriesCreate extends Usecase<
  Backend["collectionCategories"]["create"]
> {
  async exec(
    definition: CollectionCategoryDefinition,
    // TODO: with Packs, add options to:
    // - pass in collectionCategoryId
    // - skip ref-checking
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
      !(await this.repos.collectionCategory.exists(definition.parentId))
    ) {
      return makeUnsuccessfulResult(
        makeResultError("ParentCollectionCategoryNotFound", {
          parentId: definition.parentId,
        }),
      );
    }

    const collectionCategory: CollectionCategoryEntity = {
      id: Id.generate.collectionCategory(),
      name: nameValidationResult.output,
      icon: iconValidationResult.output,
      parentId: definition.parentId,
      createdAt: new Date(),
    };
    await this.repos.collectionCategory.insert(collectionCategory);

    return makeSuccessfulResult(makeCollectionCategory(collectionCategory));
  }
}
