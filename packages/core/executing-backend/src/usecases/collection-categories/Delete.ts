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
import Usecase from "../../utils/Usecase.js";
import {
  collectionCategoryHasChildren,
  collectionCategoryNotFound,
  unexpectedError,
} from "../../validation/errors.js";
import { collectionCategoryId } from "../../validation/helpers/idSchemas.js";
import makeResultSchema from "../../validation/helpers/makeResultSchema.js";

export default class CollectionCategoriesDelete extends Usecase<
  Backend["collectionCategories"]["delete"]
> {
  argumentsSchema = v.tuple([collectionCategoryId()]);
  resultSchema = makeResultSchema(v.null(), [
    collectionCategoryHasChildren(),
    collectionCategoryNotFound(),
    unexpectedError(),
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
