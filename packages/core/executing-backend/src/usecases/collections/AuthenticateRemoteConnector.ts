import {
  type Backend,
  type Collection,
  type CollectionHasNoRemote,
  type CollectionId,
  type CollectionNotFound,
  type ConnectorAuthenticationState,
  type ConnectorAuthenticationStateNotValid,
  ConnectorAuthenticationStrategy,
  type UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import * as v from "valibot";
import type CollectionEntity from "../../entities/CollectionEntity.js";
import makeCollection from "../../makers/makeCollection.js";
import makeResultError from "../../makers/makeResultError.js";
import makeSuccessfulResult from "../../makers/makeSuccessfulResult.js";
import makeUnsuccessfulResult from "../../makers/makeUnsuccessfulResult.js";
import makeValidationIssues from "../../makers/makeValidationIssues.js";
import assertCollectionRemoteConnectorExists from "../../utils/assertCollectionRemoteConnectorExists.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import Usecase from "../../utils/Usecase.js";

export default class CollectionsAuthenticateRemoteConnector extends Usecase<
  Backend["collections"]["authenticateRemoteConnector"]
> {
  async exec(
    id: CollectionId,
    connectorAuthenticationState: ConnectorAuthenticationState,
  ): ResultPromise<
    Collection,
    | CollectionNotFound
    | CollectionHasNoRemote
    | ConnectorAuthenticationStateNotValid
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

    const connector = this.getConnector(collection.remote.connector.name);
    assertCollectionRemoteConnectorExists(
      id,
      collection.remote.connector.name,
      connector,
    );

    const validationResult = v.safeParse(
      v.variant("strategy", [
        v.strictObject({
          strategy: v.pipe(
            v.string(),
            v.value(ConnectorAuthenticationStrategy.OAuthPKCE),
          ),
          email: v.string(),
          accessToken: v.string(),
          refreshToken: v.string(),
          accessTokenExpiresAt: v.date(),
        }),
      ]),
      {
        strategy: connector.authenticationStrategy,
        ...connectorAuthenticationState,
      },
    );
    if (!validationResult.success) {
      return makeUnsuccessfulResult(
        makeResultError("ConnectorAuthenticationStateNotValid", {
          collectionId: id,
          issues: makeValidationIssues(validationResult.issues),
        }),
      );
    }

    const latestVersion =
      await this.repos.collectionVersion.findLatestWhereCollectionIdEq(id);
    assertCollectionVersionExists(id, latestVersion);

    const updatedCollection: CollectionEntity = {
      ...collection,
      remote: {
        ...collection.remote,
        connectorState: {
          ...collection.remote.connectorState,
          authentication: connectorAuthenticationState,
        },
      },
    };
    await this.repos.collection.replace(updatedCollection);

    return makeSuccessfulResult(
      makeCollection(updatedCollection, latestVersion),
    );
  }
}
