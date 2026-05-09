import {
  type CollectionCategory,
  type UnexpectedError,
  backendContracts,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import makeCollectionCategory from "../../makers/makeCollectionCategory.js";
import Usecase from "../../utils/Usecase.js";

export default class CollectionCategoriesList extends Usecase<
  typeof backendContracts.collectionCategories.list
> {
  async exec(): ResultPromise<CollectionCategory[], UnexpectedError> {
    const collectionCategories = await this.repos.collectionCategory.findAll();

    return makeSuccessfulResult(
      collectionCategories.map(makeCollectionCategory),
    );
  }
}
