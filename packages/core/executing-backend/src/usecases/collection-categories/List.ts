import type {
  Backend,
  CollectionCategory,
  RpcResultPromise,
} from "@superego/backend";
import makeCollectionCategory from "../../makers/makeCollectionCategory.js";
import makeSuccessfulRpcResult from "../../makers/makeSuccessfulRpcResult.js";
import Usecase from "../../utils/Usecase.js";

export default class CollectionCategoriesList extends Usecase<
  Backend["collectionCategories"]["list"]
> {
  async exec(): RpcResultPromise<CollectionCategory[]> {
    const collectionCategories = await this.repos.collectionCategory.findAll();

    return makeSuccessfulRpcResult(
      collectionCategories.map(makeCollectionCategory),
    );
  }
}
