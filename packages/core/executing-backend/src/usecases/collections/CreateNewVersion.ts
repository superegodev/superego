import {
  type Backend,
  type Collection,
  type CollectionId,
  type CollectionMigrationFailed,
  type CollectionMigrationNotValid,
  type CollectionNotFound,
  type CollectionSchemaNotValid,
  type CollectionVersionId,
  type CollectionVersionIdNotMatching,
  type CollectionVersionSettings,
  type ContentSummaryGetterNotValid,
  DocumentVersionCreator,
  type ReferencedCollectionsNotFound,
  type RemoteConverters,
  type RemoteConvertersNotValid,
  type TypescriptModule,
  type UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  type Schema,
  utils as schemaUtils,
  valibotSchemas,
} from "@superego/schema";
import {
  extractErrorDetails,
  Id,
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import pMap from "p-map";
import * as v from "valibot";
import type CollectionVersionEntity from "../../entities/CollectionVersionEntity.js";
import type DocumentEntity from "../../entities/DocumentEntity.js";
import makeCollection from "../../makers/makeCollection.js";
import makeResultError from "../../makers/makeResultError.js";
import makeValidationIssues from "../../makers/makeValidationIssues.js";
import type ArrayElement from "../../utils/ArrayElement.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import assertDocumentVersionExists from "../../utils/assertDocumentVersionExists.js";
import isEmpty from "../../utils/isEmpty.js";
import Usecase from "../../utils/Usecase.js";
import DocumentsCreateNewVersion from "../documents/CreateNewVersion.js";

export default class CollectionsCreateNewVersion extends Usecase<
  Backend["collections"]["createNewVersion"]
> {
  async exec(
    id: CollectionId,
    latestVersionId: CollectionVersionId,
    schema: Schema,
    settings: CollectionVersionSettings,
    migration: TypescriptModule | null,
    remoteConverters: RemoteConverters | null,
  ): ResultPromise<
    Collection,
    | CollectionNotFound
    | CollectionVersionIdNotMatching
    | CollectionSchemaNotValid
    | ReferencedCollectionsNotFound
    | ContentSummaryGetterNotValid
    | CollectionMigrationNotValid
    | RemoteConvertersNotValid
    | CollectionMigrationFailed
    | UnexpectedError
  > {
    // Ensure collection exists.
    const collection = await this.repos.collection.find(id);
    if (!collection) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionNotFound", { collectionId: id }),
      );
    }

    // Ensure latestVersionId matches.
    const latestVersion =
      await this.repos.collectionVersion.findLatestWhereCollectionIdEq(id);
    assertCollectionVersionExists(id, latestVersion);
    if (latestVersionId !== latestVersion.id) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionVersionIdNotMatching", {
          collectionId: id,
          latestVersionId: latestVersion.id,
          suppliedVersionId: latestVersionId,
        }),
      );
    }

    // Validate schema.
    const schemaValidationResult = v.safeParse(valibotSchemas.schema(), schema);
    if (!schemaValidationResult.success) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionSchemaNotValid", {
          collectionId: id,
          issues: makeValidationIssues(schemaValidationResult.issues),
        }),
      );
    }

    // Replace "self" references.
    const resolvedSchema = schemaUtils.replaceSelfCollectionId(
      schemaValidationResult.output,
      id,
    );

    // Validate that all collections referenced in DocumentRef type definitions
    // exist.
    const referencedCollectionIds =
      schemaUtils.extractReferencedCollectionIds(resolvedSchema);
    const notFoundCollectionIds: string[] = [];
    for (const referencedCollectionId of referencedCollectionIds) {
      const exists = await this.repos.collection.exists(
        referencedCollectionId as CollectionId,
      );
      if (!exists) {
        notFoundCollectionIds.push(referencedCollectionId);
      }
    }
    if (!isEmpty(notFoundCollectionIds)) {
      return makeUnsuccessfulResult(
        makeResultError("ReferencedCollectionsNotFound", {
          collectionId: id,
          notFoundCollectionIds,
        }),
      );
    }

    // Validate settings.contentSummaryGetter.
    const isContentSummaryGetterValid =
      await this.javascriptSandbox.moduleDefaultExportsFunction(
        settings.contentSummaryGetter,
      );
    if (!isContentSummaryGetterValid) {
      return makeUnsuccessfulResult(
        makeResultError("ContentSummaryGetterNotValid", {
          collectionId: id,
          collectionVersionId: latestVersion.id,
          issues: [
            {
              message:
                "The default export of the contentSummaryGetter TypescriptModule is not a function",
            },
          ],
        }),
      );
    }

    // Validate migration and remoteConverters.
    if (collection.remote) {
      if (migration !== null) {
        return makeUnsuccessfulResult(
          makeResultError("CollectionMigrationNotValid", {
            collectionId: id,
            issues: [
              { message: "Collection has a remote; migration must be null." },
            ],
          }),
        );
      }
      if (remoteConverters === null) {
        return makeUnsuccessfulResult(
          makeResultError("RemoteConvertersNotValid", {
            collectionId: id,
            issues: [
              {
                message:
                  "Collection has a remote; remoteConverters must not be null.",
              },
            ],
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
    } else {
      if (migration === null) {
        return makeUnsuccessfulResult(
          makeResultError("CollectionMigrationNotValid", {
            collectionId: id,
            issues: [
              {
                message:
                  "Collection has no remote; migration must not be null.",
              },
            ],
          }),
        );
      }
      if (remoteConverters !== null) {
        return makeUnsuccessfulResult(
          makeResultError("RemoteConvertersNotValid", {
            collectionId: id,
            issues: [
              {
                message:
                  "Collection has no remote; remoteConverters must be null.",
              },
            ],
          }),
        );
      }
      if (
        !(await this.javascriptSandbox.moduleDefaultExportsFunction(migration))
      ) {
        return makeUnsuccessfulResult(
          makeResultError("CollectionMigrationNotValid", {
            collectionId: id,
            issues: [
              {
                message:
                  "The default export of the migration TypescriptModule is not a function",
              },
            ],
          }),
        );
      }
    }

    // Create new collection version.
    const collectionVersion: CollectionVersionEntity = {
      id: Id.generate.collectionVersion(),
      previousVersionId: latestVersionId,
      collectionId: id,
      schema: resolvedSchema,
      settings: {
        contentSummaryGetter: settings.contentSummaryGetter,
      },
      migration: migration,
      remoteConverters: remoteConverters,
      createdAt: new Date(),
    };
    await this.repos.collectionVersion.insert(collectionVersion);

    // Migrate documents.
    const documents = await this.repos.document.findAllWhereCollectionIdEq(id);
    const migrationResults = await pMap(
      documents,
      (document) => this.migrateDocument(migration, remoteConverters, document),
      { concurrency: 1 },
    );
    const failedDocumentMigrations = migrationResults.filter(
      (migrationResult) => migrationResult !== undefined,
    );
    if (!isEmpty(failedDocumentMigrations)) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionMigrationFailed", {
          collectionId: id,
          failedDocumentMigrations,
        }),
      );
    }

    return makeSuccessfulResult(
      makeCollection(
        collection,
        collectionVersion,
        this.getConnector(collection),
      ),
    );
  }

  private async migrateDocument(
    migration: TypescriptModule | null,
    remoteConverters: RemoteConverters | null,
    document: DocumentEntity,
  ): Promise<
    | undefined
    | ArrayElement<
        CollectionMigrationFailed["details"]["failedDocumentMigrations"]
      >
  > {
    try {
      const latestDocumentVersion =
        await this.repos.documentVersion.findLatestWhereDocumentIdEq(
          document.id,
        );
      assertDocumentVersionExists(
        document.collectionId,
        document.id,
        latestDocumentVersion,
      );

      // Migration strategy:
      // - For collections without a remote, run the migration function on the
      //   previous content.
      // - For collections with a remote, run the updated fromRemoteDocument
      //   function on the latest remote document.
      const executionResult = await this.javascriptSandbox.executeSyncFunction(
        // ! assertion as the validation above guarantees that if migration is
        // null, remoteConverters is not.
        migration !== null ? migration : remoteConverters!.fromRemoteDocument,
        [
          migration !== null
            ? latestDocumentVersion.content
            : document.latestRemoteDocument,
        ],
      );

      if (!executionResult.success) {
        return {
          documentId: document.id,
          cause: makeResultError(
            "ApplyingMigrationFailed",
            executionResult.error.details,
          ),
        };
      }

      const result = await this.sub(DocumentsCreateNewVersion).exec(
        document.collectionId,
        document.id,
        latestDocumentVersion.id,
        executionResult.data,
        {
          createdBy: DocumentVersionCreator.Migration,
          remoteVersionId: latestDocumentVersion.remoteId,
        },
      );

      if (!result.success) {
        return {
          documentId: document.id,
          cause: makeResultError("CreatingNewDocumentVersionFailed", {
            cause: result.error,
          }),
        };
      }

      // Migration succeeded.
      return;
    } catch (error) {
      return {
        documentId: document.id,
        cause: makeResultError("UnexpectedError", {
          cause: extractErrorDetails(error),
        }),
      };
    }
  }
}
