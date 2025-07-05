import type {
  Backend,
  Collection,
  CollectionId,
  RpcResultPromise,
} from "@superego/backend";
import type CollectionVersionEntity from "../../entities/CollectionVersionEntity.js";
import makeCollection from "../../makers/makeCollection.js";
import makeSuccessfulRpcResult from "../../makers/makeSuccessfulRpcResult.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import Usecase from "../../utils/Usecase.js";

export default class CollectionsList extends Usecase<
  Backend["collections"]["list"]
> {
  async exec(): RpcResultPromise<Collection[]> {
    const collections = await this.repos.collection.findAll();
    const latestVersions = await this.repos.collectionVersion.findAllLatests();
    const latestVersionsByCollectionId = new Map<
      CollectionId,
      CollectionVersionEntity
    >();
    latestVersions.forEach((latestVersion) => {
      latestVersionsByCollectionId.set(
        latestVersion.collectionId,
        latestVersion,
      );
    });

    return makeSuccessfulRpcResult(
      collections.map((collection) => {
        const latestVersion = latestVersionsByCollectionId.get(collection.id);
        assertCollectionVersionExists(collection.id, latestVersion);
        return makeCollection(collection, latestVersion);
      }),
    );
  }
}
