import {
  type Backend,
  type Collection,
  type CollectionId,
  type CollectionNotFound,
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
    connectorSettings: any,
    remoteConverters: RemoteConverters,
  ): ResultPromise<
    Collection,
    | CollectionNotFound
    | ConnectorNotFound
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

    const connector = this.getConnector(connectorName);
    if (!connector) {
      return makeUnsuccessfulResult(
        makeResultError("ConnectorNotFound", {
          collectionId: id,
          connectorName: connectorName,
        }),
      );
    }

    const connectorSettingsValidationResult = v.safeParse(
      valibotSchemas.content(connector.remoteDocumentSchema),
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

    const updatedCollection: CollectionEntity = {
      ...collection,
      remote: {
        connectorName: connectorName,
        connectorSettings: connectorSettings,
        syncState: {
          down: collection.remote
            ? collection.remote.syncState.down
            : {
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
      makeCollection(updatedCollection, updatedCollectionVersion),
    );
  }
}
