import {
  type Collection,
  type CollectionId,
  type UnexpectedError,
  backendContracts,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import type CollectionVersionEntity from "../../entities/CollectionVersionEntity.js";
import makeCollection from "../../makers/makeCollection.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import Usecase from "../../utils/Usecase.js";

export default class CollectionsList extends Usecase<
  typeof backendContracts.collections.list
> {
  async exec(): ResultPromise<Collection[], UnexpectedError> {
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

    return makeSuccessfulResult(
      collections.map((collection) => {
        const latestVersion = latestVersionsByCollectionId.get(collection.id);
        assertCollectionVersionExists(collection.id, latestVersion);
        return makeCollection(
          collection,
          latestVersion,
          this.getConnector(collection),
        );
      }),
    );
  }
}
