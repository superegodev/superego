import type {
  Backend,
  CollectionCategoryHasChildren,
  CollectionCategoryId,
  CollectionCategoryNotFound,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
  valibotSchemas,
} from "@superego/shared-utils";
import makeResultError from "../../makers/makeResultError.js";
import Usecase from "../../utils/Usecase.js";
import validateArgs from "../../utils/validateArgs.js";

export default class CollectionCategoriesDelete extends Usecase<
  Backend["collectionCategories"]["delete"]
> {
  @validateArgs([valibotSchemas.id.collectionCategory()])
  async exec(
    id: CollectionCategoryId,
  ): ResultPromise<
    null,
    CollectionCategoryNotFound | CollectionCategoryHasChildren | UnexpectedError
  > {
    if (!(await this.repos.collectionCategory.exists(id))) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionCategoryNotFound", {
          collectionCategoryId: id,
        }),
      );
    }

    if (
      (await this.repos.collectionCategory.existsWhereParentIdEq(id)) ||
      (await this.repos.collection.existsWhereSettingsCollectionCategoryIdEq(
        id,
      ))
    ) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionCategoryHasChildren", {
          collectionCategoryId: id,
        }),
      );
    }

    await this.repos.collectionCategory.delete(id);

    return makeSuccessfulResult(null);
  }
}
