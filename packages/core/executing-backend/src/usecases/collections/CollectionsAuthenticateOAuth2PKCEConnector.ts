import {
  type Backend,
  type Collection,
  type CollectionHasNoRemote,
  type CollectionId,
  type CollectionNotFound,
  type ConnectorAuthenticationSettings,
  ConnectorAuthenticationStrategy,
  type ConnectorDoesNotUseOAuth2PKCEAuthenticationStrategy,
  type UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
  valibotSchemas,
} from "@superego/shared-utils";
import * as v from "valibot";
import type CollectionEntity from "../../entities/CollectionEntity.js";
import makeCollection from "../../makers/makeCollection.js";
import makeResultError from "../../makers/makeResultError.js";
import assertCollectionRemoteConnectorExists from "../../utils/assertCollectionRemoteConnectorExists.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import Usecase from "../../utils/Usecase.js";
import validateArgs from "../../utils/validateArgs.js";

export default class CollectionsAuthenticateOAuth2PKCEConnector extends Usecase<
  Backend["collections"]["authenticateOAuth2PKCEConnector"]
> {
  @validateArgs([valibotSchemas.id.collection(), v.string()])
  async exec(
    id: CollectionId,
    authorizationResponseUrl: string,
  ): ResultPromise<
    Collection,
    | CollectionNotFound
    | CollectionHasNoRemote
    | ConnectorDoesNotUseOAuth2PKCEAuthenticationStrategy
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
      ConnectorAuthenticationStrategy.OAuth2PKCE
    ) {
      return makeUnsuccessfulResult(
        makeResultError("ConnectorDoesNotUseOAuth2PKCEAuthenticationStrategy", {
          collectionId: id,
          connectorName: connector.name,
        }),
      );
    }

    const getAuthenticationStateResult = await connector.getAuthenticationState(
      {
        authenticationSettings: collection.remote.connector
          .authenticationSettings as ConnectorAuthenticationSettings.OAuth2PKCE,
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
