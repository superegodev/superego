import {
  type CollectionHasNoRemote,
  type CollectionId,
  type CollectionNotFound,
  type CommandConfirmationNotValid,
  type DocumentContentNotValid,
  type DocumentNotFound,
  DocumentVersionCreator,
  type DocumentVersionIdNotMatching,
  DownSyncStatus,
  type ExecutingJavascriptFunctionFailed,
  type FilesNotFound,
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
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import assertDocumentVersionExists from "../../utils/assertDocumentVersionExists.js";
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
    void,
    CollectionNotFound | CollectionHasNoRemote | UnexpectedError
  > {
    const collection = await this.repos.collection.find(id);
    if (!collection) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionNotFound", { collectionId: id }),
      );
    }

    const collectionVersion =
      await this.repos.collectionVersion.findLatestWhereCollectionIdEq(id);
    assertCollectionVersionExists(id, collectionVersion);

    if (!hasRemote(collection)) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionHasNoRemote", { collectionId: id }),
      );
    }

    const connector = this.getConnector(collection.remote.connectorName);
    if (!connector) {
      await this.markDownSyncAsFailed(
        collection,
        makeResultError("ConnectorNotFound", {
          collectionId: id,
          connectorName: collection.remote.connectorName,
        }),
      );
      return makeSuccessfulResult(undefined);
    }

    const syncDownResult = await connector.syncDown(
      collection.remote.syncState.down.syncedUntil,
    );
    if (!syncDownResult.success) {
      await this.markDownSyncAsFailed(collection, syncDownResult.error);
      return makeSuccessfulResult(undefined);
    }

    const { changes, syncPoint } = syncDownResult.data;
    const beforeProcessChangesSavepoint = await this.repos.createSavepoint();
    const syncChangesResult = await this.syncChanges(
      collection,
      collectionVersion as CollectionVersionEntity & {
        remoteConverters: RemoteConverters;
      }, // TODO: assert this has remoteConverters
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

    return makeSuccessfulResult(undefined);
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
  ): ResultPromise<void, SyncingChangesFailed> {
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
      ? makeSuccessfulResult(undefined)
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
    void,
    | ResultError<
        "RemoteDocumentContentNotValid",
        { issues: ValidationIssue[] }
      >
    | ResultError<
        "ConvertingRemoteDocumentFailed",
        { cause: ExecutingJavascriptFunctionFailed }
      >
    | ResultError<
        "CreatingDocumentFailed",
        {
          cause:
            | CollectionNotFound
            | DocumentContentNotValid
            | FilesNotFound
            | UnexpectedError;
        }
      >
    | ResultError<
        "CreatingNewDocumentVersionFailed",
        {
          cause:
            | DocumentNotFound
            | DocumentVersionIdNotMatching
            | DocumentContentNotValid
            | FilesNotFound
            | UnexpectedError;
        }
      >
  > {
    const validationResult = v.safeParse(
      valibotSchemas.content(connector.remoteDocumentSchema),
      addedOrModified.content,
    );
    if (!validationResult.success) {
      return makeUnsuccessfulResult(
        makeResultError("RemoteDocumentContentNotValid", {
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
          cause: conversionResult.error,
        }),
      );
    }

    const document = await this.repos.document.findWhereRemoteIdEq(
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
        ? makeSuccessfulResult(undefined)
        : makeUnsuccessfulResult(
            makeResultError("CreatingDocumentFailed", {
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
        ? makeSuccessfulResult(undefined)
        : makeUnsuccessfulResult(
            makeResultError("CreatingNewDocumentVersionFailed", {
              cause: documentsCreateNewVersionResult.error,
            }),
          );
    }

    return makeSuccessfulResult(undefined);
  }

  private async delete(
    collection: CollectionEntity & { remote: RemoteEntity },
    deleted: Connector.DeletedDocument,
  ): ResultPromise<
    void,
    DocumentNotFound | CommandConfirmationNotValid | UnexpectedError
  > {
    const document = await this.repos.document.findWhereRemoteIdEq(deleted.id);
    if (!document) {
      return makeSuccessfulResult(undefined);
    }

    const documentsDeleteResult = await this.sub(DocumentsDelete).exec(
      collection.id,
      document.id,
      "delete",
    );
    return documentsDeleteResult.success
      ? makeSuccessfulResult(undefined)
      : makeUnsuccessfulResult(documentsDeleteResult.error);
  }
}

// TODO: move to CollectionUtils
function hasRemote(
  collection: CollectionEntity,
): collection is CollectionEntity & { remote: RemoteEntity } {
  return collection.remote !== null;
}
