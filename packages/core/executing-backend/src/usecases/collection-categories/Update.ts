import type {
  Backend,
  CollectionCategory,
  CollectionCategoryIconNotValid,
  CollectionCategoryId,
  CollectionCategoryNameNotValid,
  CollectionCategoryNotFound,
  ParentCollectionCategoryIsDescendant,
  ParentCollectionCategoryNotFound,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
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

export default class CollectionCategoriesUpdate extends Usecase<
  Backend["collectionCategories"]["update"]
> {
  async exec(
    id: CollectionCategoryId,
    patch: Partial<Pick<CollectionCategory, "name" | "icon" | "parentId">>,
  ): ResultPromise<
    CollectionCategory,
    | CollectionCategoryNotFound
    | CollectionCategoryNameNotValid
    | CollectionCategoryIconNotValid
    | ParentCollectionCategoryNotFound
    | ParentCollectionCategoryIsDescendant
    | UnexpectedError
  > {
    const collectionCategories = await this.repos.collectionCategory.findAll();
    const collectionCategoriesById = collectionCategories.reduce<
      Record<CollectionCategoryId, CollectionCategoryEntity>
    >((record, collectionCategory) => {
      record[collectionCategory.id] = collectionCategory;
      return record;
    }, {});

    const collectionCategory = collectionCategoriesById[id];
    if (!collectionCategory) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionCategoryNotFound", {
          collectionCategoryId: id,
        }),
      );
    }

    const nameValidationResult = patch.name
      ? v.safeParse(valibotSchemas.collectionCategoryName(), patch.name)
      : null;

    if (nameValidationResult && !nameValidationResult.success) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionCategoryNameNotValid", {
          collectionCategoryId: id,
          issues: makeValidationIssues(nameValidationResult.issues),
        }),
      );
    }

    const iconValidationResult =
      patch.icon !== undefined
        ? v.safeParse(v.nullable(valibotSchemas.icon()), patch.icon)
        : null;

    if (iconValidationResult && !iconValidationResult.success) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionCategoryIconNotValid", {
          collectionCategoryId: id,
          issues: makeValidationIssues(iconValidationResult.issues),
        }),
      );
    }

    if (patch.parentId && !collectionCategoriesById[patch.parentId]) {
      return makeUnsuccessfulResult(
        makeResultError("ParentCollectionCategoryNotFound", {
          parentId: patch.parentId,
        }),
      );
    }

    if (
      patch.parentId &&
      this.isDescendant(patch.parentId, id, collectionCategoriesById)
    ) {
      return makeUnsuccessfulResult(
        makeResultError("ParentCollectionCategoryIsDescendant", {
          parentId: patch.parentId,
        }),
      );
    }

    const updatedCollectionCategory: CollectionCategoryEntity = {
      id: id,
      name: nameValidationResult?.output ?? collectionCategory.name,
      icon:
        iconValidationResult?.output !== undefined
          ? iconValidationResult.output
          : collectionCategory.icon,
      parentId:
        patch.parentId !== undefined
          ? patch.parentId
          : collectionCategory.parentId,
      createdAt: collectionCategory.createdAt,
    };
    await this.repos.collectionCategory.replace(updatedCollectionCategory);

    return makeSuccessfulResult(
      makeCollectionCategory(updatedCollectionCategory),
    );
  }

  /** Checks whether descendant is indeed a descendant of ancestor. */
  private isDescendant(
    descendantId: CollectionCategoryId,
    ancestorId: CollectionCategoryId,
    collectionCategoriesById: Record<
      CollectionCategoryId,
      CollectionCategoryEntity
    >,
  ): boolean {
    const descendant = collectionCategoriesById[descendantId]!;
    if (descendant.parentId === null) {
      return false;
    }

    if (descendant.parentId === ancestorId) {
      return true;
    }

    const parent = collectionCategoriesById[descendant.parentId]!;
    return this.isDescendant(parent.id, ancestorId, collectionCategoriesById);
  }
}
