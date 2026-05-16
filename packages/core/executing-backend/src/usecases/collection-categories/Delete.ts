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
} from "@superego/shared-utils";
import * as v from "valibot";
import makeResultError from "../../makers/makeResultError.js";
import * as structuralSchemas from "../../structural-schemas/index.js";
import BackendUsecase from "../../utils/BackendUsecase.js";

export default class CollectionCategoriesDelete extends BackendUsecase<
  Backend["collectionCategories"]["delete"]
> {
  argumentsSchema = v.tuple([
    structuralSchemas.backend.ids.collectionCategoryId(),
  ]);
  resultSchema = structuralSchemas.global.result(v.null(), [
    structuralSchemas.backend.errors.collectionCategoryHasChildren(),
    structuralSchemas.backend.errors.collectionCategoryNotFound(),
    structuralSchemas.backend.errors.unexpectedError(),
  ]);

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
