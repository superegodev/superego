import * as v from "valibot";
import AppNotFoundSchema from "../../errors/AppNotFound.js";
import ArgumentsNotValidSchema from "../../errors/ArgumentsNotValid.js";
import CannotChangeCollectionRemoteConnectorSchema from "../../errors/CannotChangeCollectionRemoteConnector.js";
import CollectionCategoryNotFoundSchema from "../../errors/CollectionCategoryNotFound.js";
import CollectionHasDocumentsSchema from "../../errors/CollectionHasDocuments.js";
import CollectionHasNoRemoteSchema from "../../errors/CollectionHasNoRemote.js";
import CollectionIsReferencedSchema from "../../errors/CollectionIsReferenced.js";
import CollectionIsSyncingSchema from "../../errors/CollectionIsSyncing.js";
import CollectionMigrationFailedSchema from "../../errors/CollectionMigrationFailed.js";
import CollectionMigrationNotValidSchema from "../../errors/CollectionMigrationNotValid.js";
import CollectionNotFoundSchema from "../../errors/CollectionNotFound.js";
import CollectionSchemaNotValidSchema from "../../errors/CollectionSchemaNotValid.js";
import CollectionSettingsNotValidSchema from "../../errors/CollectionSettingsNotValid.js";
import CollectionVersionIdNotMatchingSchema from "../../errors/CollectionVersionIdNotMatching.js";
import CollectionVersionNotFoundSchema from "../../errors/CollectionVersionNotFound.js";
import CommandConfirmationNotValidSchema from "../../errors/CommandConfirmationNotValid.js";
import ConnectorAuthenticationSettingsNotValidSchema from "../../errors/ConnectorAuthenticationSettingsNotValid.js";
import ConnectorDoesNotUseOAuth2PKCEAuthenticationStrategySchema from "../../errors/ConnectorDoesNotUseOAuth2PKCEAuthenticationStrategy.js";
import ConnectorNotAuthenticatedSchema from "../../errors/ConnectorNotAuthenticated.js";
import ConnectorNotFoundSchema from "../../errors/ConnectorNotFound.js";
import ConnectorSettingsNotValidSchema from "../../errors/ConnectorSettingsNotValid.js";
import ContentBlockingKeysGetterNotValidSchema from "../../errors/ContentBlockingKeysGetterNotValid.js";
import ContentSummaryGetterNotValidSchema from "../../errors/ContentSummaryGetterNotValid.js";
import DefaultDocumentViewUiOptionsNotValidSchema from "../../errors/DefaultDocumentViewUiOptionsNotValid.js";
import DocumentIsReferencedSchema from "../../errors/DocumentIsReferenced.js";
import MakingContentBlockingKeysFailedSchema from "../../errors/MakingContentBlockingKeysFailed.js";
import ReferencedCollectionsNotFoundSchema from "../../errors/ReferencedCollectionsNotFound.js";
import RemoteConvertersNotValidSchema from "../../errors/RemoteConvertersNotValid.js";
import UnexpectedErrorSchema from "../../errors/UnexpectedError.js";
import CollectionIdSchema from "../../ids/CollectionId.js";
import CollectionVersionIdSchema from "../../ids/CollectionVersionId.js";
import CollectionSchema from "../../types/Collection.js";
import CollectionVersionSchema from "../../types/CollectionVersion.js";
import ConnectorSchema from "../../types/Connector.js";

// Inner fields like `schema`, `versionSettings`, `connectorAuthenticationSettings`,
// `remoteConverters`, `migration`, `settings` are validated semantically inside
// the usecases (with their own valibot schemas, returning specific errors like
// CollectionSchemaNotValid). The structural layer just shape-checks the outer
// shell; the deep semantic check stays in the usecase.
const collectionDefinitionInputSchema = v.object({
  settings: v.any(),
  schema: v.any(),
  versionSettings: v.any(),
});
const collectionVersionSettingsInputSchema = v.any();
const connectorAuthenticationSettingsInputSchema = v.any();
const remoteConvertersInputSchema = v.any();
const schemaInputSchema = v.any();
const typescriptModuleInputSchema = v.any();

export const collectionsContracts = {
  create: {
    argumentsSchema: v.tuple([collectionDefinitionInputSchema]),
    dataSchema: CollectionSchema,
    errorSchemas: [
      ArgumentsNotValidSchema,
      CollectionSettingsNotValidSchema,
      CollectionCategoryNotFoundSchema,
      AppNotFoundSchema,
      CollectionSchemaNotValidSchema,
      ReferencedCollectionsNotFoundSchema,
      ContentBlockingKeysGetterNotValidSchema,
      ContentSummaryGetterNotValidSchema,
      DefaultDocumentViewUiOptionsNotValidSchema,
      UnexpectedErrorSchema,
    ],
  },
  createMany: {
    argumentsSchema: v.tuple([v.array(collectionDefinitionInputSchema)]),
    dataSchema: v.array(CollectionSchema),
    errorSchemas: [
      ArgumentsNotValidSchema,
      CollectionSettingsNotValidSchema,
      CollectionCategoryNotFoundSchema,
      AppNotFoundSchema,
      CollectionSchemaNotValidSchema,
      ReferencedCollectionsNotFoundSchema,
      ContentBlockingKeysGetterNotValidSchema,
      ContentSummaryGetterNotValidSchema,
      DefaultDocumentViewUiOptionsNotValidSchema,
      UnexpectedErrorSchema,
    ],
  },
  updateSettings: {
    argumentsSchema: v.tuple([
      CollectionIdSchema,
      v.object({
        name: v.optional(v.string()),
        icon: v.optional(v.nullable(v.string())),
        collectionCategoryId: v.optional(v.nullable(v.string())),
        defaultCollectionViewAppId: v.optional(v.nullable(v.string())),
        description: v.optional(v.nullable(v.string())),
        assistantInstructions: v.optional(v.nullable(v.string())),
        redirectToCollectionAfterDocumentCreation: v.optional(v.boolean()),
      }),
    ]),
    dataSchema: CollectionSchema,
    errorSchemas: [
      ArgumentsNotValidSchema,
      CollectionNotFoundSchema,
      CollectionSettingsNotValidSchema,
      CollectionCategoryNotFoundSchema,
      AppNotFoundSchema,
      UnexpectedErrorSchema,
    ],
  },
  setRemote: {
    argumentsSchema: v.tuple([
      CollectionIdSchema,
      v.string(),
      connectorAuthenticationSettingsInputSchema,
      v.any(),
      remoteConvertersInputSchema,
    ]),
    dataSchema: CollectionSchema,
    errorSchemas: [
      ArgumentsNotValidSchema,
      CollectionNotFoundSchema,
      CollectionHasDocumentsSchema,
      ConnectorNotFoundSchema,
      CannotChangeCollectionRemoteConnectorSchema,
      ConnectorAuthenticationSettingsNotValidSchema,
      ConnectorSettingsNotValidSchema,
      RemoteConvertersNotValidSchema,
      UnexpectedErrorSchema,
    ],
  },
  getOAuth2PKCEConnectorAuthorizationRequestUrl: {
    argumentsSchema: v.tuple([CollectionIdSchema]),
    dataSchema: v.string(),
    errorSchemas: [
      ArgumentsNotValidSchema,
      CollectionNotFoundSchema,
      CollectionHasNoRemoteSchema,
      ConnectorDoesNotUseOAuth2PKCEAuthenticationStrategySchema,
      UnexpectedErrorSchema,
    ],
  },
  authenticateOAuth2PKCEConnector: {
    argumentsSchema: v.tuple([CollectionIdSchema, v.string()]),
    dataSchema: CollectionSchema,
    errorSchemas: [
      ArgumentsNotValidSchema,
      CollectionNotFoundSchema,
      CollectionHasNoRemoteSchema,
      ConnectorDoesNotUseOAuth2PKCEAuthenticationStrategySchema,
      UnexpectedErrorSchema,
    ],
  },
  triggerDownSync: {
    argumentsSchema: v.tuple([CollectionIdSchema]),
    dataSchema: CollectionSchema,
    errorSchemas: [
      ArgumentsNotValidSchema,
      CollectionNotFoundSchema,
      CollectionHasNoRemoteSchema,
      CollectionIsSyncingSchema,
      ConnectorNotAuthenticatedSchema,
      UnexpectedErrorSchema,
    ],
  },
  createNewVersion: {
    argumentsSchema: v.tuple([
      CollectionIdSchema,
      CollectionVersionIdSchema,
      schemaInputSchema,
      collectionVersionSettingsInputSchema,
      v.nullable(typescriptModuleInputSchema),
      v.nullable(remoteConvertersInputSchema),
    ]),
    dataSchema: CollectionSchema,
    errorSchemas: [
      ArgumentsNotValidSchema,
      CollectionNotFoundSchema,
      CollectionVersionIdNotMatchingSchema,
      CollectionSchemaNotValidSchema,
      ReferencedCollectionsNotFoundSchema,
      ContentSummaryGetterNotValidSchema,
      ContentBlockingKeysGetterNotValidSchema,
      DefaultDocumentViewUiOptionsNotValidSchema,
      CollectionMigrationNotValidSchema,
      RemoteConvertersNotValidSchema,
      CollectionMigrationFailedSchema,
      UnexpectedErrorSchema,
    ],
  },
  updateLatestVersionSettings: {
    argumentsSchema: v.tuple([
      CollectionIdSchema,
      CollectionVersionIdSchema,
      v.object({
        contentBlockingKeysGetter: v.optional(
          v.nullable(typescriptModuleInputSchema),
        ),
        contentSummaryGetter: v.optional(typescriptModuleInputSchema),
        defaultDocumentViewUiOptions: v.optional(v.any()),
      }),
    ]),
    dataSchema: CollectionSchema,
    errorSchemas: [
      ArgumentsNotValidSchema,
      CollectionNotFoundSchema,
      CollectionVersionIdNotMatchingSchema,
      ContentBlockingKeysGetterNotValidSchema,
      MakingContentBlockingKeysFailedSchema,
      ContentSummaryGetterNotValidSchema,
      DefaultDocumentViewUiOptionsNotValidSchema,
      UnexpectedErrorSchema,
    ],
  },
  delete: {
    argumentsSchema: v.tuple([CollectionIdSchema, v.string()]),
    dataSchema: v.null(),
    errorSchemas: [
      ArgumentsNotValidSchema,
      CollectionNotFoundSchema,
      CommandConfirmationNotValidSchema,
      CollectionIsReferencedSchema,
      DocumentIsReferencedSchema,
      UnexpectedErrorSchema,
    ],
  },
  list: {
    argumentsSchema: v.tuple([]),
    dataSchema: v.array(CollectionSchema),
    errorSchemas: [ArgumentsNotValidSchema, UnexpectedErrorSchema],
  },
  listConnectors: {
    argumentsSchema: v.tuple([]),
    dataSchema: v.array(ConnectorSchema),
    errorSchemas: [ArgumentsNotValidSchema, UnexpectedErrorSchema],
  },
  getVersion: {
    argumentsSchema: v.tuple([CollectionIdSchema, CollectionVersionIdSchema]),
    dataSchema: CollectionVersionSchema,
    errorSchemas: [
      ArgumentsNotValidSchema,
      CollectionVersionNotFoundSchema,
      UnexpectedErrorSchema,
    ],
  },
} as const;
