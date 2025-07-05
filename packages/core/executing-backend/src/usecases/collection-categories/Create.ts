import type {
  Backend,
  CollectionCategory,
  CollectionCategoryIconNotValid,
  CollectionCategoryNameNotValid,
  ParentCollectionCategoryNotFound,
  RpcResultPromise,
} from "@superego/backend";
import { Id, valibotSchemas } from "@superego/shared-utils";
import * as v from "valibot";
import type CollectionCategoryEntity from "../../entities/CollectionCategoryEntity.js";
import makeCollectionCategory from "../../makers/makeCollectionCategory.js";
import makeRpcError from "../../makers/makeRpcError.js";
import makeSuccessfulRpcResult from "../../makers/makeSuccessfulRpcResult.js";
import makeUnsuccessfulRpcResult from "../../makers/makeUnsuccessfulRpcResult.js";
import makeValidationIssues from "../../makers/makeValidationIssues.js";
import Usecase from "../../utils/Usecase.js";

export default class CollectionCategoriesCreate extends Usecase<
  Backend["collectionCategories"]["create"]
> {
  async exec(
    proto: Pick<CollectionCategory, "name" | "icon" | "parentId">,
  ): RpcResultPromise<
    CollectionCategory,
    | CollectionCategoryNameNotValid
    | CollectionCategoryIconNotValid
    | ParentCollectionCategoryNotFound
  > {
    const nameValidationResult = v.safeParse(
      valibotSchemas.collectionCategoryName(),
      proto.name,
    );

    if (!nameValidationResult.success) {
      return makeUnsuccessfulRpcResult(
        makeRpcError("CollectionCategoryNameNotValid", {
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
      return makeUnsuccessfulRpcResult(
        makeRpcError("CollectionCategoryIconNotValid", {
          collectionCategoryId: null,
          issues: makeValidationIssues(iconValidationResult.issues),
        }),
      );
    }

    if (
      proto.parentId &&
      !(await this.repos.collectionCategory.exists(proto.parentId))
    ) {
      return makeUnsuccessfulRpcResult(
        makeRpcError("ParentCollectionCategoryNotFound", {
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

    return makeSuccessfulRpcResult(makeCollectionCategory(collectionCategory));
  }
}
