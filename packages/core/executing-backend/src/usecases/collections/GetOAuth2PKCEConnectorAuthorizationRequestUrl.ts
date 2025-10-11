import {
  type Backend,
  type CollectionHasNoRemote,
  type CollectionId,
  type CollectionNotFound,
  type ConnectorAuthenticationSettings,
  type ConnectorAuthenticationState,
  ConnectorAuthenticationStrategy,
  type ConnectorDoesNotUseOAuth2PKCEAuthenticationStrategy,
  type UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import makeResultError from "../../makers/makeResultError.js";
import makeSuccessfulResult from "../../makers/makeSuccessfulResult.js";
import makeUnsuccessfulResult from "../../makers/makeUnsuccessfulResult.js";
import assertCollectionRemoteConnectorExists from "../../utils/assertCollectionRemoteConnectorExists.js";
import Usecase from "../../utils/Usecase.js";

export default class CollectionsGetOAuth2PKCEConnectorAuthorizationRequestUrl extends Usecase<
  Backend["collections"]["getOAuth2PKCEConnectorAuthorizationRequestUrl"]
> {
  async exec(
    id: CollectionId,
  ): ResultPromise<
    string,
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

    const authorizationRequestUrl = await connector.getAuthorizationRequestUrl({
      collectionId: id,
      authenticationSettings: collection.remote.connector
        .authenticationSettings as ConnectorAuthenticationSettings.OAuth2PKCE,
      authenticationState: collection.remote
        .connectorAuthenticationState as ConnectorAuthenticationState.OAuth2PKCE | null,
    });
    return makeSuccessfulResult(authorizationRequestUrl);
  }
}
