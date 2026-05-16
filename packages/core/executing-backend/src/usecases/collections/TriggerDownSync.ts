import {
  type Backend,
  BackgroundJobName,
  type Collection,
  type CollectionHasNoRemote,
  type CollectionId,
  type CollectionIsSyncing,
  type CollectionNotFound,
  ConnectorAuthenticationStrategy,
  type ConnectorNotAuthenticated,
  DownSyncStatus,
  type UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import * as v from "valibot";
import type CollectionEntity from "../../entities/CollectionEntity.js";
import makeCollection from "../../makers/makeCollection.js";
import makeResultError from "../../makers/makeResultError.js";
import * as structuralSchemas from "../../structural-schemas/index.js";
import assertCollectionRemoteConnectorExists from "../../utils/assertCollectionRemoteConnectorExists.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import BackendUsecase from "../../utils/BackendUsecase.js";

export default class CollectionsTriggerDownSync extends BackendUsecase<
  Backend["collections"]["triggerDownSync"]
> {
  argumentsSchema = v.tuple([structuralSchemas.backend.ids.collectionId()]);
  resultSchema = structuralSchemas.global.result(
    structuralSchemas.backend.types.collection(),
    [
      structuralSchemas.backend.errors.collectionHasNoRemote(),
      structuralSchemas.backend.errors.collectionIsSyncing(),
      structuralSchemas.backend.errors.collectionNotFound(),
      structuralSchemas.backend.errors.connectorNotAuthenticated(),
      structuralSchemas.backend.errors.unexpectedError(),
    ],
  );

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

    const connector = this.getConnector(collection);
    assertCollectionRemoteConnectorExists(
      id,
      collection.remote.connector.name,
      connector,
    );
    if (
      connector.authenticationStrategy ===
        ConnectorAuthenticationStrategy.OAuth2PKCE &&
      !collection.remote.connectorAuthenticationState
    ) {
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
      makeCollection(updatedCollection, latestCollectionVersion, connector),
    );
  }
}
