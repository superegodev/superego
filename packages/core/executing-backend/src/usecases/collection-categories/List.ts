import type {
  Backend,
  CollectionCategory,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import * as v from "valibot";
import makeCollectionCategory from "../../makers/makeCollectionCategory.js";
import Usecase from "../../utils/Usecase.js";
import { collectionCategory } from "../../validation/domain/collectionCategory.js";
import { unexpectedError } from "../../validation/errors.js";
import makeResultSchema from "../../validation/helpers/makeResultSchema.js";

export default class CollectionCategoriesList extends Usecase<
  Backend["collectionCategories"]["list"]
> {
  argumentsSchema = v.tuple([]);
  resultSchema = makeResultSchema(v.array(collectionCategory()), [
    unexpectedError(),
  ]);

  async exec(): ResultPromise<CollectionCategory[], UnexpectedError> {
    const collectionCategories = await this.repos.collectionCategory.findAll();

    return makeSuccessfulResult(
      collectionCategories.map(makeCollectionCategory),
    );
  }
}
