import {
  type Backend,
  type Collection,
  type CollectionHasNoRemote,
  type CollectionId,
  type CollectionNotFound,
  type ConnectorAuthenticationSettings,
  ConnectorAuthenticationStrategy,
  type ConnectorDoesNotUseOAuth2AuthenticationStrategy,
  type UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import type CollectionEntity from "../../entities/CollectionEntity.js";
import makeCollection from "../../makers/makeCollection.js";
import makeResultError from "../../makers/makeResultError.js";
import makeSuccessfulResult from "../../makers/makeSuccessfulResult.js";
import makeUnsuccessfulResult from "../../makers/makeUnsuccessfulResult.js";
import assertCollectionRemoteConnectorExists from "../../utils/assertCollectionRemoteConnectorExists.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import Usecase from "../../utils/Usecase.js";

export default class CollectionsAuthenticateOAuth2Connector extends Usecase<
  Backend["collections"]["authenticateOAuth2Connector"]
> {
  async exec(
    id: CollectionId,
    authorizationResponseUrl: string,
  ): ResultPromise<
    Collection,
    | CollectionNotFound
    | CollectionHasNoRemote
    | ConnectorDoesNotUseOAuth2AuthenticationStrategy
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
        makeResultError("CollectionHasNoRemote", {
          collectionId: id,
        }),
      );
    }

    const connector = this.getConnector(collection);
    assertCollectionRemoteConnectorExists(
      id,
      collection.remote.connector.name,
      connector,
    );

    if (
      connector.authenticationStrategy !==
      ConnectorAuthenticationStrategy.OAuth2
    ) {
      return makeUnsuccessfulResult(
        makeResultError("ConnectorDoesNotUseOAuth2AuthenticationStrategy", {
          collectionId: id,
          connectorName: connector.name,
        }),
      );
    }

    const getAuthenticationStateResult = await connector.getAuthenticationState(
      {
        authenticationSettings: collection.remote.connector
          .authenticationSettings as ConnectorAuthenticationSettings.OAuth2,
        authorizationResponseUrl: authorizationResponseUrl,
      },
    );

    if (!getAuthenticationStateResult.success) {
      return makeUnsuccessfulResult(getAuthenticationStateResult.error);
    }

    const latestVersion =
      await this.repos.collectionVersion.findLatestWhereCollectionIdEq(id);
    assertCollectionVersionExists(id, latestVersion);

    const updatedCollection: CollectionEntity = {
      ...collection,
      remote: {
        ...collection.remote,
        connectorAuthenticationState: getAuthenticationStateResult.data,
      },
    };
    await this.repos.collection.replace(updatedCollection);

    return makeSuccessfulResult(
      makeCollection(updatedCollection, latestVersion, connector),
    );
  }
}
