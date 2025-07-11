import type {
  Backend,
  Collection,
  CollectionId,
  CollectionMigrationFailed,
  CollectionMigrationNotValid,
  CollectionNotFound,
  CollectionSchemaNotValid,
  CollectionSummaryPropertiesNotValid,
  CollectionVersionId,
  CollectionVersionIdNotMatching,
  CollectionVersionSettings,
  RpcResultPromise,
  TypescriptModule,
} from "@superego/backend";
import { type Schema, valibotSchemas } from "@superego/schema";
import { Id } from "@superego/shared-utils";
import * as v from "valibot";
import type CollectionVersionEntity from "../../entities/CollectionVersionEntity.js";
import type DocumentEntity from "../../entities/DocumentEntity.js";
import makeCollection from "../../makers/makeCollection.js";
import makeRpcError from "../../makers/makeRpcError.js";
import makeSuccessfulRpcResult from "../../makers/makeSuccessfulRpcResult.js";
import makeUnsuccessfulRpcResult from "../../makers/makeUnsuccessfulRpcResult.js";
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
  ): RpcResultPromise<
    Collection,
    | CollectionNotFound
    | CollectionVersionIdNotMatching
    | CollectionSchemaNotValid
    | CollectionSummaryPropertiesNotValid
    | CollectionMigrationNotValid
    | CollectionMigrationFailed
  > {
    const collection = await this.repos.collection.find(id);
    if (!collection) {
      return makeUnsuccessfulRpcResult(
        makeRpcError("CollectionNotFound", { collectionId: id }),
      );
    }

    const latestVersion =
      await this.repos.collectionVersion.findLatestWhereCollectionIdEq(id);
    assertCollectionVersionExists(id, latestVersion);
    if (latestVersionId !== latestVersion.id) {
      return makeUnsuccessfulRpcResult(
        makeRpcError("CollectionVersionIdNotMatching", {
          collectionId: id,
          latestVersionId: latestVersion.id,
          suppliedVersionId: latestVersionId,
        }),
      );
    }

    const schemaValidationResult = v.safeParse(valibotSchemas.schema(), schema);
    if (!schemaValidationResult.success) {
      return makeUnsuccessfulRpcResult(
        makeRpcError("CollectionSchemaNotValid", {
          collectionId: id,
          issues: makeValidationIssues(schemaValidationResult.issues),
        }),
      );
    }

    const nonValidSummaryPropertyIndexes = (
      await Promise.all(
        settings.summaryProperties.map(({ getter }) =>
          this.javascriptSandbox.moduleDefaultExportsFunction(getter),
        ),
      )
    ).reduce<number[]>(
      (indexes, isValid, index) => (isValid ? indexes : [...indexes, index]),
      [],
    );
    if (!isEmpty(nonValidSummaryPropertyIndexes)) {
      return makeUnsuccessfulRpcResult(
        makeRpcError("CollectionSummaryPropertiesNotValid", {
          collectionId: id,
          collectionVersionId: null,
          issues: nonValidSummaryPropertyIndexes.map((index) => ({
            // TODO: i18n
            message:
              "The default export of the getter TypescriptModule is not a function",
            path: [{ key: index }, { key: "getter" }],
          })),
        }),
      );
    }

    if (
      !(await this.javascriptSandbox.moduleDefaultExportsFunction(migration))
    ) {
      return makeUnsuccessfulRpcResult(
        makeRpcError("CollectionMigrationNotValid", {
          collectionId: id,
          issues: [
            {
              // TODO: i18n
              message:
                "The default export of the migration TypescriptModule is not a function",
            },
          ],
        }),
      );
    }

    const collectionVersion: CollectionVersionEntity = {
      id: Id.generate.collectionVersion(),
      previousVersionId: latestVersionId,
      collectionId: id,
      schema: schemaValidationResult.output,
      settings: settings,
      migration: migration,
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
      return makeUnsuccessfulRpcResult(
        makeRpcError("CollectionMigrationFailed", {
          collectionId: id,
          failedDocumentMigrations,
        }),
      );
    }

    return makeSuccessfulRpcResult(
      makeCollection(collection, collectionVersion),
    );
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
          cause: {
            name: "ApplyingMigrationFailed",
            details: executionResult.error,
          },
        };
      }

      const documentsCreateNewVersion = new DocumentsCreateNewVersion(
        this.repos,
        this.javascriptSandbox,
      );
      const result = await documentsCreateNewVersion.exec(
        document.collectionId,
        document.id,
        latestDocumentVersion.id,
        executionResult.returnedValue,
      );

      if (!result.success) {
        return {
          documentId: document.id,
          cause: {
            name: "CreatingNewDocumentVersionFailed",
            details: { cause: result.error },
          },
        };
      }

      // Migration succeeded.
      return;
    } catch (error) {
      return {
        documentId: document.id,
        cause: makeRpcError("UnexpectedError", { cause: error }),
      };
    }
  }
}
