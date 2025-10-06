import {
  type Backend,
  BackgroundJobName,
  type Collection,
  type CollectionHasNoRemote,
  type CollectionId,
  type CollectionIsSyncing,
  type CollectionNotFound,
  type ConnectorNotAuthenticated,
  DownSyncStatus,
  type UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import type CollectionEntity from "../../entities/CollectionEntity.js";
import makeCollection from "../../makers/makeCollection.js";
import makeResultError from "../../makers/makeResultError.js";
import makeSuccessfulResult from "../../makers/makeSuccessfulResult.js";
import makeUnsuccessfulResult from "../../makers/makeUnsuccessfulResult.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import Usecase from "../../utils/Usecase.js";

export default class CollectionsTriggerDownSync extends Usecase<
  Backend["collections"]["triggerDownSync"]
> {
  async exec(
    id: CollectionId,
  ): ResultPromise<
    Collection,
    | CollectionNotFound
    | CollectionHasNoRemote
    | CollectionIsSyncing
    | ConnectorNotAuthenticated
    | UnexpectedError
  > {
    const collection = await this.repos.collection.find(id);
    if (!collection) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionNotFound", { collectionId: id }),
      );
    }

    if (!collection.remote) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionHasNoRemote", { collectionId: id }),
      );
    }

    if (collection.remote.syncState.down.status === DownSyncStatus.Syncing) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionIsSyncing", { collectionId: id }),
      );
    }

    if (!collection.remote.connectorState.authentication) {
      return makeUnsuccessfulResult(
        makeResultError("ConnectorNotAuthenticated", {
          collectionId: id,
          connectorName: collection.remote.connector.name,
        }),
      );
    }

    const latestCollectionVersion =
      await this.repos.collectionVersion.findLatestWhereCollectionIdEq(id);
    assertCollectionVersionExists(id, latestCollectionVersion);

    const updatedCollection: CollectionEntity = {
      ...collection,
      remote: {
        ...collection.remote,
        syncState: {
          ...collection.remote.syncState,
          down: {
            ...collection.remote.syncState.down,
            status: DownSyncStatus.Syncing,
            error: null,
          },
        },
      },
    };
    await this.repos.collection.replace(updatedCollection);

    await this.enqueueBackgroundJob({
      name: BackgroundJobName.DownSyncCollection,
      input: { id },
    });

    return makeSuccessfulResult(
      makeCollection(updatedCollection, latestCollectionVersion),
    );
  }
}
