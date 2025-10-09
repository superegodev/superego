import {
  type Backend,
  type CannotChangeCollectionRemoteConnector,
  type Collection,
  type CollectionId,
  type CollectionNotFound,
  type ConnectorAuthenticationSettings,
  type ConnectorAuthenticationSettingsNotValid,
  ConnectorAuthenticationStrategy,
  type ConnectorNotFound,
  type ConnectorSettingsNotValid,
  DownSyncStatus,
  type RemoteConverters,
  type RemoteConvertersNotValid,
  type UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { valibotSchemas } from "@superego/schema";
import * as v from "valibot";
import type CollectionEntity from "../../entities/CollectionEntity.js";
import type CollectionVersionEntity from "../../entities/CollectionVersionEntity.js";
import makeCollection from "../../makers/makeCollection.js";
import makeResultError from "../../makers/makeResultError.js";
import makeSuccessfulResult from "../../makers/makeSuccessfulResult.js";
import makeUnsuccessfulResult from "../../makers/makeUnsuccessfulResult.js";
import makeValidationIssues from "../../makers/makeValidationIssues.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import Usecase from "../../utils/Usecase.js";

export default class CollectionsSetRemote extends Usecase<
  Backend["collections"]["setRemote"]
> {
  async exec(
    id: CollectionId,
    connectorName: string,
    connectorAuthenticationSettings: ConnectorAuthenticationSettings,
    connectorSettings: any,
    remoteConverters: RemoteConverters,
  ): ResultPromise<
    Collection,
    | CollectionNotFound
    | ConnectorNotFound
    | CannotChangeCollectionRemoteConnector
    | ConnectorAuthenticationSettingsNotValid
    | ConnectorSettingsNotValid
    | RemoteConvertersNotValid
    | UnexpectedError
  > {
    const collection = await this.repos.collection.find(id);
    if (!collection) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionNotFound", { collectionId: id }),
      );
    }

    if (
      collection.remote &&
      collection.remote.connector.name !== connectorName
    ) {
      return makeUnsuccessfulResult(
        makeResultError("CannotChangeCollectionRemoteConnector", {
          collectionId: id,
          currentConnectorName: collection.remote.connector.name,
          suppliedConnectorName: connectorName,
        }),
      );
    }

    const connector = this.getConnector(connectorName);
    if (!connector) {
      return makeUnsuccessfulResult(
        makeResultError("ConnectorNotFound", {
          collectionId: id,
          connectorName: connectorName,
        }),
      );
    }

    const connectorAuthenticationSettingsValidationResult = v.safeParse(
      v.variant("strategy", [
        v.strictObject({
          strategy: v.pipe(
            v.string(),
            v.value(ConnectorAuthenticationStrategy.ApiKey),
          ),
          apiKey: v.pipe(v.string(), v.minLength(1)),
        }),
        v.strictObject({
          strategy: v.pipe(
            v.string(),
            v.value(ConnectorAuthenticationStrategy.OAuth2PKCE),
          ),
          clientId: v.pipe(v.string(), v.minLength(1)),
          clientSecret: v.nullable(v.pipe(v.string(), v.minLength(1))),
        }),
      ]),
      {
        strategy: connector.authenticationStrategy,
        ...connectorAuthenticationSettings,
      },
    );
    if (!connectorAuthenticationSettingsValidationResult.success) {
      return makeUnsuccessfulResult(
        makeResultError("ConnectorAuthenticationSettingsNotValid", {
          collectionId: id,
          connectorName: connectorName,
          issues: makeValidationIssues(
            connectorAuthenticationSettingsValidationResult.issues,
          ),
        }),
      );
    }

    const connectorSettingsValidationResult = v.safeParse(
      valibotSchemas.content(connector.settingsSchema),
      connectorSettings,
    );
    if (!connectorSettingsValidationResult.success) {
      return makeUnsuccessfulResult(
        makeResultError("ConnectorSettingsNotValid", {
          connectorName: connectorName,
          issues: makeValidationIssues(
            connectorSettingsValidationResult.issues,
          ),
        }),
      );
    }

    if (
      !(await this.javascriptSandbox.moduleDefaultExportsFunction(
        remoteConverters.fromRemoteDocument,
      ))
    ) {
      return makeUnsuccessfulResult(
        makeResultError("RemoteConvertersNotValid", {
          collectionId: id,
          issues: [
            {
              message:
                "The default export of the fromRemoteDocument TypescriptModule is not a function",
              path: [{ key: "fromRemoteDocument" }],
            },
          ],
        }),
      );
    }

    const latestVersion =
      await this.repos.collectionVersion.findLatestWhereCollectionIdEq(id);
    assertCollectionVersionExists(id, latestVersion);

    // TODO: figure out in which circumstances it makes sense to reset connector
    // and sync states.
    const updatedCollection: CollectionEntity = {
      ...collection,
      remote: {
        connector: {
          name: connectorName,
          authenticationSettings: connectorAuthenticationSettings,
          settings: connectorSettings,
        },
        connectorAuthenticationState:
          collection.remote?.connectorAuthenticationState ?? null,
        syncState: collection.remote?.syncState ?? {
          down: {
            status: DownSyncStatus.NeverSynced,
            error: null,
            syncedUntil: null,
            lastSucceededAt: null,
          },
        },
      },
    };
    const updatedCollectionVersion: CollectionVersionEntity = {
      ...latestVersion,
      remoteConverters,
    };
    await this.repos.collection.replace(updatedCollection);
    await this.repos.collectionVersion.replace(updatedCollectionVersion);

    return makeSuccessfulResult(
      makeCollection(updatedCollection, updatedCollectionVersion, connector),
    );
  }
}
