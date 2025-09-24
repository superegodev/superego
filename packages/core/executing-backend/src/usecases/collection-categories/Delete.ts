import type {
  Backend,
  CollectionCategoryHasChildren,
  CollectionCategoryId,
  CollectionCategoryNotFound,
  DeletedEntities,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import makeDeletedEntities from "../../makers/makeDeletedEntities.js";
import makeResultError from "../../makers/makeResultError.js";
import makeSuccessfulResult from "../../makers/makeSuccessfulResult.js";
import makeUnsuccessfulResult from "../../makers/makeUnsuccessfulResult.js";
import Usecase from "../../utils/Usecase.js";

export default class CollectionCategoriesDelete extends Usecase<
  Backend["collectionCategories"]["delete"]
> {
  async exec(
    id: CollectionCategoryId,
  ): ResultPromise<
    DeletedEntities,
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

    return makeSuccessfulResult(
      makeDeletedEntities({ collectionCategories: [id] }),
    );
  }
}
