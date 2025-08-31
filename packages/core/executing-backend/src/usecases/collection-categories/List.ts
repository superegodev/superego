import type {
  Backend,
  CollectionCategory,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import makeCollectionCategory from "../../makers/makeCollectionCategory.js";
import makeSuccessfulResult from "../../makers/makeSuccessfulResult.js";
import Usecase from "../../utils/Usecase.js";

export default class CollectionCategoriesList extends Usecase<
  Backend["collectionCategories"]["list"]
> {
  async exec(): ResultPromise<CollectionCategory[], UnexpectedError> {
    const collectionCategories = await this.repos.collectionCategory.findAll();

    return makeSuccessfulResult(
      collectionCategories.map(makeCollectionCategory),
    );
  }
}
