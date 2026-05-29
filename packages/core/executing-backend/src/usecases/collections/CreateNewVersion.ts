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
  type ContentBlockingKeysGetterNotValid,
  type ContentSummaryGetterNotValid,
  type DefaultDocumentViewUiOptionsNotValid,
  DocumentContentChangeType,
  DocumentVersionCreator,
  type ReferencedCollectionsNotFound,
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
  valibotSchemas as sharedUtilsValibotSchemas,
} from "@superego/shared-utils";
import pMap from "p-map";
import * as v from "valibot";
import type CollectionVersionEntity from "../../entities/CollectionVersionEntity.js";
import type DocumentEntity from "../../entities/DocumentEntity.js";
import makeCollection from "../../makers/makeCollection.js";
import makeResultError from "../../makers/makeResultError.js";
import makeValidationIssues from "../../makers/makeValidationIssues.js";
import * as structuralSchemas from "../../structural-schemas/index.js";
import type ArrayElement from "../../utils/ArrayElement.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import assertDocumentVersionExists from "../../utils/assertDocumentVersionExists.js";
import BackendUsecase from "../../utils/BackendUsecase.js";
import isEmpty from "../../utils/isEmpty.js";
import DocumentsCreateNewVersion from "../documents/CreateNewVersion.js";

export default class CollectionsCreateNewVersion extends BackendUsecase<
  Backend["collections"]["createNewVersion"]
> {
  argumentsSchema = v.tuple([
    structuralSchemas.backend.ids.collectionId(),
    structuralSchemas.backend.ids.collectionVersionId(),
    structuralSchemas.schema.schemaShape() as unknown as v.GenericSchema<
      unknown,
      Schema
    >,
    structuralSchemas.backend.types.collectionVersionSettings(),
    structuralSchemas.backend.types.typescriptModule(),
  ]);
  resultSchema = structuralSchemas.global.result(
    structuralSchemas.backend.types.collection(),
    [
      structuralSchemas.backend.errors.collectionMigrationFailed(),
      structuralSchemas.backend.errors.collectionMigrationNotValid(),
      structuralSchemas.backend.errors.collectionNotFound(),
      structuralSchemas.backend.errors.collectionSchemaNotValid(),
      structuralSchemas.backend.errors.collectionVersionIdNotMatching(),
      structuralSchemas.backend.errors.contentBlockingKeysGetterNotValid(),
      structuralSchemas.backend.errors.contentSummaryGetterNotValid(),
      structuralSchemas.backend.errors.defaultDocumentViewUiOptionsNotValid(),
      structuralSchemas.backend.errors.referencedCollectionsNotFound(),
      structuralSchemas.backend.errors.unexpectedError(),
    ],
  );

  async exec(
    id: CollectionId,
    latestVersionId: CollectionVersionId,
    schema: Schema,
    settings: CollectionVersionSettings,
    migration: TypescriptModule,
  ): ResultPromise<
    Collection,
    | CollectionNotFound
    | CollectionVersionIdNotMatching
    | CollectionSchemaNotValid
    | ReferencedCollectionsNotFound
    | ContentBlockingKeysGetterNotValid
    | ContentSummaryGetterNotValid
    | DefaultDocumentViewUiOptionsNotValid
    | CollectionMigrationNotValid
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

    // Validate settings.contentBlockingKeysGetter.
    if (settings.contentBlockingKeysGetter !== null) {
      const isContentBlockingKeysGetterValid =
        await this.javascriptSandbox.moduleDefaultExportsFunction(
          settings.contentBlockingKeysGetter,
        );
      if (!isContentBlockingKeysGetterValid) {
        return makeUnsuccessfulResult(
          makeResultError("ContentBlockingKeysGetterNotValid", {
            collectionId: id,
            collectionVersionId: latestVersion.id,
            issues: [
              {
                message:
                  "The default export of the contentBlockingKeysGetter TypescriptModule is not a function",
              },
            ],
          }),
        );
      }
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

    // Validate settings.defaultDocumentViewUiOptions.
    if (settings.defaultDocumentViewUiOptions !== null) {
      const uiOptionsValidationResult = v.safeParse(
        sharedUtilsValibotSchemas.defaultDocumentViewUiOptions(resolvedSchema),
        settings.defaultDocumentViewUiOptions,
      );
      if (!uiOptionsValidationResult.success) {
        return makeUnsuccessfulResult(
          makeResultError("DefaultDocumentViewUiOptionsNotValid", {
            collectionId: id,
            collectionVersionId: latestVersion.id,
            issues: makeValidationIssues(uiOptionsValidationResult.issues),
          }),
        );
      }
    }

    // Validate migration.
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

    // Create new collection version.
    const collectionVersion: CollectionVersionEntity = {
      id: Id.generate.collectionVersion(),
      previousVersionId: latestVersionId,
      collectionId: id,
      schema: resolvedSchema,
      settings: {
        contentSummaryGetter: settings.contentSummaryGetter,
        contentBlockingKeysGetter: settings.contentBlockingKeysGetter,
        defaultDocumentViewUiOptions: settings.defaultDocumentViewUiOptions,
      },
      migration: migration,
      createdAt: new Date(),
    };
    await this.repos.collectionVersion.insert(collectionVersion);

    // Migrate documents.
    const documents = await this.repos.document.findAllWhereCollectionIdEq(id);
    const migrationResults = await pMap(
      documents,
      (document) => this.migrateDocument(migration, document),
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
        {
          type: DocumentContentChangeType.Full,
          content: executionResult.data,
        },
        {
          createdBy: DocumentVersionCreator.Migration,
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
