import {
  type Backend,
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
} from "@superego/shared-utils";
import * as v from "valibot";
import makeResultError from "../../makers/makeResultError.js";
import * as structuralSchemas from "../../structural-schemas/index.js";
import assertCollectionRemoteConnectorExists from "../../utils/assertCollectionRemoteConnectorExists.js";
import BackendUsecase from "../../utils/BackendUsecase.js";

export default class CollectionsGetOAuth2PKCEConnectorAuthorizationRequestUrl extends BackendUsecase<
  Backend["collections"]["getOAuth2PKCEConnectorAuthorizationRequestUrl"]
> {
  argumentsSchema = v.tuple([structuralSchemas.backend.ids.collectionId()]);
  resultSchema = structuralSchemas.global.result(v.string(), [
    structuralSchemas.backend.errors.collectionHasNoRemote(),
    structuralSchemas.backend.errors.collectionNotFound(),
    structuralSchemas.backend.errors.connectorDoesNotUseOAuth2PKCEAuthenticationStrategy(),
    structuralSchemas.backend.errors.unexpectedError(),
  ]);

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
    });
    return makeSuccessfulResult(authorizationRequestUrl);
  }
}
