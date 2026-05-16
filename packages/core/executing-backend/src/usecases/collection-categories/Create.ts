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
import * as structuralSchemas from "../../structural-schemas/index.js";
import BackendUsecase from "../../utils/BackendUsecase.js";

interface CollectionCategoriesCreateOptions {
  collectionCategoryId?: CollectionCategoryId;
  skipReferenceCheckForCollectionCategoryIds?: CollectionCategoryId[];
}

export default class CollectionCategoriesCreate extends BackendUsecase<
  Backend["collectionCategories"]["create"]
> {
  argumentsSchema = v.tuple([
    structuralSchemas.backend.types.collectionCategoryDefinition(),
  ]);
  resultSchema = structuralSchemas.global.result(
    structuralSchemas.backend.types.collectionCategory(),
    [
      structuralSchemas.backend.errors.collectionCategoryIconNotValid(),
      structuralSchemas.backend.errors.collectionCategoryNameNotValid(),
      structuralSchemas.backend.errors.parentCollectionCategoryNotFound(),
      structuralSchemas.backend.errors.unexpectedError(),
    ],
  );

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
