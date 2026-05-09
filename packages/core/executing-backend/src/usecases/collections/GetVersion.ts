import {
  type CollectionId,
  type CollectionVersion,
  type CollectionVersionId,
  type CollectionVersionNotFound,
  type UnexpectedError,
  backendContracts,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import makeCollectionVersion from "../../makers/makeCollectionVersion.js";
import makeResultError from "../../makers/makeResultError.js";
import Usecase from "../../utils/Usecase.js";

export default class CollectionsGetVersion extends Usecase<
  typeof backendContracts.collections.getVersion
> {
  async exec(
    collectionId: CollectionId,
    collectionVersionId: CollectionVersionId,
  ): ResultPromise<
    CollectionVersion,
    CollectionVersionNotFound | UnexpectedError
  > {
    const collectionVersion =
      await this.repos.collectionVersion.find(collectionVersionId);

    if (!collectionVersion || collectionVersion.collectionId !== collectionId) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionVersionNotFound", {
          collectionId,
          collectionVersionId,
        }),
      );
    }

    return makeSuccessfulResult(makeCollectionVersion(collectionVersion));
  }
}
