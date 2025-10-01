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
  type RemoteConverters,
  type TypescriptModule,
  type UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { type Schema, valibotSchemas } from "@superego/schema";
import { extractErrorDetails, Id } from "@superego/shared-utils";
import * as v from "valibot";
import type CollectionVersionEntity from "../../entities/CollectionVersionEntity.js";
import type DocumentEntity from "../../entities/DocumentEntity.js";
import makeCollection from "../../makers/makeCollection.js";
import makeResultError from "../../makers/makeResultError.js";
import makeSuccessfulResult from "../../makers/makeSuccessfulResult.js";
import makeUnsuccessfulResult from "../../makers/makeUnsuccessfulResult.js";
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
    migration: TypescriptModule,
    remoteConverters: RemoteConverters,
  ): ResultPromise<
    Collection,
    | CollectionNotFound
    | CollectionVersionIdNotMatching
    | CollectionSchemaNotValid
    | ContentSummaryGetterNotValid
    | CollectionMigrationNotValid
    | CollectionMigrationFailed
    | UnexpectedError
  > {
    const collection = await this.repos.collection.find(id);
    if (!collection) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionNotFound", { collectionId: id }),
      );
    }

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

    const schemaValidationResult = v.safeParse(valibotSchemas.schema(), schema);
    if (!schemaValidationResult.success) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionSchemaNotValid", {
          collectionId: id,
          issues: makeValidationIssues(schemaValidationResult.issues),
        }),
      );
    }

    const isContentSummaryGetterValid =
      await this.javascriptSandbox.moduleDefaultExportsFunction(
        settings.contentSummaryGetter,
      );
    if (!isContentSummaryGetterValid) {
      return makeUnsuccessfulResult(
        makeResultError("ContentSummaryGetterNotValid", {
          collectionId: null,
          collectionVersionId: null,
          issues: [
            {
              message:
                "The default export of the getter TypescriptModule is not a function",
              path: [{ key: "getter" }],
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

    // TODO: validate remote converters

    const collectionVersion: CollectionVersionEntity = {
      id: Id.generate.collectionVersion(),
      previousVersionId: latestVersionId,
      collectionId: id,
      schema: schemaValidationResult.output,
      settings: {
        contentSummaryGetter: settings.contentSummaryGetter,
      },
      migration: migration,
      remoteConverters: remoteConverters,
      createdAt: new Date(),
    };
    await this.repos.collectionVersion.insert(collectionVersion);

    const documents = await this.repos.document.findAllWhereCollectionIdEq(id);
    const migrationResults = await Promise.all(
      documents.map((document) => this.migrateDocument(migration, document)),
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

    return makeSuccessfulResult(makeCollection(collection, collectionVersion));
  }

  private async migrateDocument(
    migration: TypescriptModule,
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

      const executionResult = await this.javascriptSandbox.executeSyncFunction(
        migration,
        [latestDocumentVersion.content],
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
          remoteId: latestDocumentVersion.remoteId,
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
