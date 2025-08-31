import type {
  Backend,
  CollectionCategory,
  CollectionCategoryIconNotValid,
  CollectionCategoryNameNotValid,
  ParentCollectionCategoryNotFound,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { Id, valibotSchemas } from "@superego/shared-utils";
import * as v from "valibot";
import type CollectionCategoryEntity from "../../entities/CollectionCategoryEntity.js";
import makeCollectionCategory from "../../makers/makeCollectionCategory.js";
import makeResultError from "../../makers/makeResultError.js";
import makeSuccessfulResult from "../../makers/makeSuccessfulResult.js";
import makeUnsuccessfulResult from "../../makers/makeUnsuccessfulResult.js";
import makeValidationIssues from "../../makers/makeValidationIssues.js";
import Usecase from "../../utils/Usecase.js";

export default class CollectionCategoriesCreate extends Usecase<
  Backend["collectionCategories"]["create"]
> {
  async exec(
    proto: Pick<CollectionCategory, "name" | "icon" | "parentId">,
  ): ResultPromise<
    CollectionCategory,
    | CollectionCategoryNameNotValid
    | CollectionCategoryIconNotValid
    | ParentCollectionCategoryNotFound
    | UnexpectedError
  > {
    const nameValidationResult = v.safeParse(
      valibotSchemas.collectionCategoryName(),
      proto.name,
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
      proto.icon,
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
      proto.parentId &&
      !(await this.repos.collectionCategory.exists(proto.parentId))
    ) {
      return makeUnsuccessfulResult(
        makeResultError("ParentCollectionCategoryNotFound", {
          parentId: proto.parentId,
        }),
      );
    }

    const collectionCategory: CollectionCategoryEntity = {
      id: Id.generate.collectionCategory(),
      name: nameValidationResult.output,
      icon: iconValidationResult.output,
      parentId: proto.parentId,
      createdAt: new Date(),
    };
    await this.repos.collectionCategory.insert(collectionCategory);

    return makeSuccessfulResult(makeCollectionCategory(collectionCategory));
  }
}
