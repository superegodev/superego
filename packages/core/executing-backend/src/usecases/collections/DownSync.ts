import {
  type CollectionHasNoRemote,
  type CollectionId,
  type CollectionNotFound,
  DocumentVersionCreator,
  DownSyncStatus,
  type ExecutingJavascriptFunctionFailed,
  type RemoteConverters,
  type SyncingChangesFailed,
  type UnexpectedError,
  type ValidationIssue,
} from "@superego/backend";
import type { ResultError, ResultPromise } from "@superego/global-types";
import { valibotSchemas } from "@superego/schema";
import * as v from "valibot";
import type CollectionEntity from "../../entities/CollectionEntity.js";
import type CollectionVersionEntity from "../../entities/CollectionVersionEntity.js";
import type RemoteEntity from "../../entities/RemoteEntity.js";
import makeResultError from "../../makers/makeResultError.js";
import makeSuccessfulResult from "../../makers/makeSuccessfulResult.js";
import makeUnsuccessfulResult from "../../makers/makeUnsuccessfulResult.js";
import makeValidationIssues from "../../makers/makeValidationIssues.js";
import type Connector from "../../requirements/Connector.js";
import assertCollectionRemoteConnectorExists from "../../utils/assertCollectionRemoteConnectorExists.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import assertCollectionVersionHasRemoteConverters from "../../utils/assertCollectionVersionHasRemoteConverters.js";
import assertDocumentVersionExists from "../../utils/assertDocumentVersionExists.js";
import CollectionUtils from "../../utils/CollectionUtils.js";
import isEmpty from "../../utils/isEmpty.js";
import Usecase from "../../utils/Usecase.js";
import DocumentsCreate from "../documents/Create.js";
import DocumentsCreateNewVersion from "../documents/CreateNewVersion.js";
import DocumentsDelete from "../documents/Delete.js";

export default class CollectionsDownSync extends Usecase {
  async exec({
    id,
  }: {
    id: CollectionId;
  }): ResultPromise<
    null,
    CollectionNotFound | CollectionHasNoRemote | UnexpectedError
  > {
    const collection = await this.repos.collection.find(id);
    if (!collection) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionNotFound", { collectionId: id }),
      );
    }

    if (!CollectionUtils.hasRemote(collection)) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionHasNoRemote", { collectionId: id }),
      );
    }

    if (!collection.remote.connectorState.authentication) {
      await this.markDownSyncAsFailed(
        collection,
        makeResultError("ConnectorNotAuthenticated", {
          collectionId: id,
          connectorName: collection.remote.connector.name,
        }),
      );
      return makeSuccessfulResult(null);
    }

    const collectionVersion =
      await this.repos.collectionVersion.findLatestWhereCollectionIdEq(id);
    assertCollectionVersionExists(id, collectionVersion);
    assertCollectionVersionHasRemoteConverters(collectionVersion);

    const connector = this.getConnector(collection.remote.connector.name);
    assertCollectionRemoteConnectorExists(
      id,
      collection.remote.connector.name,
      connector,
    );

    const syncDownResult = await connector.syncDown(
      collection.remote.connectorState.authentication,
      collection.remote.connector.settings,
      collection.remote.syncState.down.syncedUntil,
    );
    if (!syncDownResult.success) {
      await this.markDownSyncAsFailed(collection, syncDownResult.error);
      return makeSuccessfulResult(null);
    }

    const { changes, syncPoint } = syncDownResult.data;
    const beforeProcessChangesSavepoint = await this.repos.createSavepoint();
    const syncChangesResult = await this.syncChanges(
      collection,
      collectionVersion,
      connector,
      changes,
    );

    if (syncChangesResult.success) {
      await this.repos.collection.replace({
        ...collection,
        remote: {
          ...collection.remote,
          syncState: {
            ...collection.remote.syncState,
            down: {
              status: DownSyncStatus.LastSyncSucceeded,
              error: null,
              lastSucceededAt: new Date(),
              syncedUntil: syncPoint,
            },
          },
        },
      });
    } else {
      await this.repos.rollbackToSavepoint(beforeProcessChangesSavepoint);
      await this.repos.collection.replace({
        ...collection,
        remote: {
          ...collection.remote,
          syncState: {
            ...collection.remote.syncState,
            down: {
              ...collection.remote.syncState.down,
              status: DownSyncStatus.LastSyncFailed,
              error: syncChangesResult.error,
            },
          },
        },
      });
    }

    return makeSuccessfulResult(null);
  }

  private async markDownSyncAsFailed(
    collection: CollectionEntity & { remote: RemoteEntity },
    error: NonNullable<RemoteEntity["syncState"]["down"]["error"]>,
  ) {
    await this.repos.collection.replace({
      ...collection,
      remote: {
        ...collection.remote!,
        syncState: {
          ...collection.remote!.syncState,
          down: {
            ...collection.remote!.syncState.down,
            status: DownSyncStatus.LastSyncFailed,
            error: error,
          },
        },
      },
    });
  }

  private async syncChanges(
    collection: CollectionEntity & { remote: RemoteEntity },
    collectionVersion: CollectionVersionEntity & {
      remoteConverters: RemoteConverters;
    },
    connector: Connector,
    changes: Connector.Changes,
  ): ResultPromise<null, SyncingChangesFailed> {
    const errors: ResultError<any, any>[] = [];

    for (const addedOrModified of changes.addedOrModified) {
      const addOrModifyResult = await this.addOrModify(
        collection,
        collectionVersion,
        connector,
        addedOrModified,
      );
      if (!addOrModifyResult.success) {
        errors.push(addOrModifyResult.error);
      }
    }

    for (const deleted of changes.deleted) {
      const deleteResult = await this.delete(collection, deleted);
      if (!deleteResult.success) {
        errors.push(deleteResult.error);
      }
    }

    return isEmpty(errors)
      ? makeSuccessfulResult(null)
      : makeUnsuccessfulResult(
          makeResultError("SyncingChangesFailed", {
            collectionId: collection.id,
            errors: errors,
          }),
        );
  }

  private async addOrModify(
    collection: CollectionEntity & { remote: RemoteEntity },
    collectionVersion: CollectionVersionEntity & {
      remoteConverters: RemoteConverters;
    },
    connector: Connector,
    addedOrModified: Connector.AddedOrModifiedDocument,
  ): ResultPromise<
    null,
    | ResultError<
        "RemoteDocumentContentNotValid",
        { issues: ValidationIssue[] }
      >
    | ResultError<
        "ConvertingRemoteDocumentFailed",
        { cause: ExecutingJavascriptFunctionFailed }
      >
    | ResultError<"CreatingDocumentFailed", { cause: ResultError<string, any> }>
    | ResultError<
        "CreatingNewDocumentVersionFailed",
        { cause: ResultError<string, any> }
      >
  > {
    const validationResult = v.safeParse(
      valibotSchemas.content(connector.remoteDocumentSchema),
      addedOrModified.content,
    );
    if (!validationResult.success) {
      return makeUnsuccessfulResult(
        makeResultError("RemoteDocumentContentNotValid", {
          remoteDocumentId: addedOrModified.id,
          remoteDocumentVersionId: addedOrModified.versionId,
          issues: makeValidationIssues(validationResult.issues),
        }),
      );
    }

    const conversionResult = await this.javascriptSandbox.executeSyncFunction(
      collectionVersion.remoteConverters.fromRemoteDocument,
      [validationResult.output],
    );
    if (!conversionResult.success) {
      return makeUnsuccessfulResult(
        makeResultError("ConvertingRemoteDocumentFailed", {
          remoteDocumentId: addedOrModified.id,
          remoteDocumentVersionId: addedOrModified.versionId,
          cause: conversionResult.error,
        }),
      );
    }

    const document =
      await this.repos.document.findWhereCollectionIdAndRemoteIdEq(
        collection.id,
        addedOrModified.id,
      );

    if (!document) {
      const documentsCreateResult = await this.sub(DocumentsCreate).exec(
        collection.id,
        conversionResult.data,
        {
          createdBy: DocumentVersionCreator.Connector,
          remoteId: addedOrModified.id,
          remoteVersionId: addedOrModified.versionId,
        },
      );
      return documentsCreateResult.success
        ? makeSuccessfulResult(null)
        : makeUnsuccessfulResult(
            makeResultError("CreatingDocumentFailed", {
              remoteDocumentId: addedOrModified.id,
              remoteDocumentVersionId: addedOrModified.versionId,
              cause: documentsCreateResult.error,
            }),
          );
    }

    const documentVersion =
      await this.repos.documentVersion.findLatestWhereDocumentIdEq(document.id);
    assertDocumentVersionExists(collection.id, document.id, documentVersion);

    if (documentVersion.remoteId !== addedOrModified.versionId) {
      const documentsCreateNewVersionResult = await this.sub(
        DocumentsCreateNewVersion,
      ).exec(
        collection.id,
        document.id,
        documentVersion.id,
        conversionResult.data,
        {
          createdBy: DocumentVersionCreator.Connector,
          remoteId: addedOrModified.versionId,
        },
      );
      return documentsCreateNewVersionResult.success
        ? makeSuccessfulResult(null)
        : makeUnsuccessfulResult(
            makeResultError("CreatingNewDocumentVersionFailed", {
              remoteDocumentId: addedOrModified.id,
              remoteDocumentVersionId: addedOrModified.versionId,
              cause: documentsCreateNewVersionResult.error,
            }),
          );
    }

    return makeSuccessfulResult(null);
  }

  private async delete(
    collection: CollectionEntity & { remote: RemoteEntity },
    deleted: Connector.DeletedDocument,
  ): ResultPromise<null, ResultError<string, any>> {
    const document =
      await this.repos.document.findWhereCollectionIdAndRemoteIdEq(
        collection.id,
        deleted.id,
      );
    if (!document) {
      return makeSuccessfulResult(null);
    }

    const documentsDeleteResult = await this.sub(DocumentsDelete).exec(
      collection.id,
      document.id,
      "delete",
      true,
    );
    return documentsDeleteResult.success
      ? makeSuccessfulResult(null)
      : makeUnsuccessfulResult(documentsDeleteResult.error);
  }
}
