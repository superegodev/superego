import type {
  Backend,
  CollectionCategoryHasChildren,
  CollectionCategoryId,
  CollectionCategoryNotFound,
  DeletedEntities,
  RpcResultPromise,
} from "@superego/backend";
import makeDeletedEntities from "../../makers/makeDeletedEntities.js";
import makeRpcError from "../../makers/makeRpcError.js";
import makeSuccessfulRpcResult from "../../makers/makeSuccessfulRpcResult.js";
import makeUnsuccessfulRpcResult from "../../makers/makeUnsuccessfulRpcResult.js";
import Usecase from "../../utils/Usecase.js";

export default class CollectionCategoriesDelete extends Usecase<
  Backend["collectionCategories"]["delete"]
> {
  async exec(
    id: CollectionCategoryId,
  ): RpcResultPromise<
    DeletedEntities,
    CollectionCategoryNotFound | CollectionCategoryHasChildren
  > {
    if (!(await this.repos.collectionCategory.exists(id))) {
      return makeUnsuccessfulRpcResult(
        makeRpcError("CollectionCategoryNotFound", {
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
      return makeUnsuccessfulRpcResult(
        makeRpcError("CollectionCategoryHasChildren", {
          collectionCategoryId: id,
        }),
      );
    }

    await this.repos.collectionCategory.delete(id);

    return makeSuccessfulRpcResult(
      makeDeletedEntities({ collectionCategories: [id] }),
    );
  }
}
