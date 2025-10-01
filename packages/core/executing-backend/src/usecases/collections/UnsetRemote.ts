import type {
  Backend,
  Collection,
  CollectionHasNoRemote,
  CollectionId,
  CollectionNotFound,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import type CollectionEntity from "../../entities/CollectionEntity.js";
import type CollectionVersionEntity from "../../entities/CollectionVersionEntity.js";
import makeCollection from "../../makers/makeCollection.js";
import makeResultError from "../../makers/makeResultError.js";
import makeSuccessfulResult from "../../makers/makeSuccessfulResult.js";
import makeUnsuccessfulResult from "../../makers/makeUnsuccessfulResult.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import Usecase from "../../utils/Usecase.js";

export default class CollectionsUnsetRemote extends Usecase<
  Backend["collections"]["unsetRemote"]
> {
  async exec(
    id: CollectionId,
  ): ResultPromise<
    Collection,
    CollectionNotFound | CollectionHasNoRemote | UnexpectedError
  > {
    const collection = await this.repos.collection.find(id);
    if (!collection) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionNotFound", { collectionId: id }),
      );
    }

    if (!collection.remote) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionHasNoRemote", {
          collectionId: id,
        }),
      );
    }

    const latestVersion =
      await this.repos.collectionVersion.findLatestWhereCollectionIdEq(id);
    assertCollectionVersionExists(id, latestVersion);

    const updatedCollection: CollectionEntity = {
      ...collection,
      remote: null,
    };
    const updatedCollectionVersion: CollectionVersionEntity = {
      ...latestVersion,
      remoteConverters: null,
    };
    await this.repos.collection.replace(updatedCollection);
    await this.repos.collectionVersion.replace(updatedCollectionVersion);

    return makeSuccessfulResult(
      makeCollection(updatedCollection, updatedCollectionVersion),
    );
  }
}
