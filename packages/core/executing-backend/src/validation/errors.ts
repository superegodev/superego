import type {
  CollectionMigrationFailed,
  DuplicateDocumentDetected,
  MakingContentBlockingKeysFailed,
  Message,
} from "@superego/backend";
import type { ResultError } from "@superego/global-types";
import * as v from "valibot";
import {
  appId,
  backgroundJobId,
  collectionCategoryId,
  collectionId,
  collectionVersionId,
  conversationId,
  documentId,
  documentVersionId,
  fileId,
  packId,
  protoCollectionId,
} from "./helpers/idSchemas.js";
import makeErrorSchema from "./helpers/makeErrorSchema.js";
import validationIssueSchema from "./helpers/validationIssueSchema.js";

const issues = () => v.array(validationIssueSchema());
const resultErrorRecord = () =>
  v.strictObject({ name: v.string(), details: v.any() });

export const appNameNotValid = () =>
  makeErrorSchema(
    "AppNameNotValid",
    v.strictObject({
      appId: v.nullable(appId()),
      issues: issues(),
    }),
  );

export const appNotFound = () =>
  makeErrorSchema("AppNotFound", v.strictObject({ appId: appId() }));

export const argumentsNotValid = () =>
  makeErrorSchema("ArgumentsNotValid", v.strictObject({ issues: issues() }));

export const backgroundJobNotFound = () =>
  makeErrorSchema(
    "BackgroundJobNotFound",
    v.strictObject({ backgroundJobId: backgroundJobId() }),
  );

export const cannotChangeCollectionRemoteConnector = () =>
  makeErrorSchema(
    "CannotChangeCollectionRemoteConnector",
    v.strictObject({
      collectionId: collectionId(),
      currentConnectorName: v.string(),
      suppliedConnectorName: v.string(),
    }),
  );

export const cannotContinueConversation = () =>
  makeErrorSchema(
    "CannotContinueConversation",
    v.strictObject({
      conversationId: conversationId(),
      reason: v.picklist([
        "ConversationIsProcessing",
        "ConversationHasError",
        "ConversationHasOutdatedContext",
      ]),
    }),
  );

export const cannotRecoverConversation = () =>
  makeErrorSchema(
    "CannotRecoverConversation",
    v.strictObject({
      conversationId: conversationId(),
      reason: v.picklist([
        "ConversationIsIdle",
        "ConversationIsProcessing",
        "ConversationHasOutdatedContext",
      ]),
    }),
  );

export const cannotRetryLastResponse = () =>
  makeErrorSchema(
    "CannotRetryLastResponse",
    v.strictObject({
      conversationId: conversationId(),
      reason: v.picklist([
        "ResponseHadSideEffects",
        "ConversationHasError",
        "ConversationIsProcessing",
        "ConversationHasOutdatedContext",
      ]),
    }),
  );

export const cannotTranscribeAudioMessage = () =>
  makeErrorSchema(
    "CannotTranscribeAudioMessage",
    v.strictObject({ conversationId: conversationId() }),
  );

export const collectionCategoryHasChildren = () =>
  makeErrorSchema(
    "CollectionCategoryHasChildren",
    v.strictObject({ collectionCategoryId: collectionCategoryId() }),
  );

export const collectionCategoryIconNotValid = () =>
  makeErrorSchema(
    "CollectionCategoryIconNotValid",
    v.strictObject({
      collectionCategoryId: v.nullable(collectionCategoryId()),
      issues: issues(),
    }),
  );

export const collectionCategoryNameNotValid = () =>
  makeErrorSchema(
    "CollectionCategoryNameNotValid",
    v.strictObject({
      collectionCategoryId: v.nullable(collectionCategoryId()),
      issues: issues(),
    }),
  );

export const collectionCategoryNotFound = () =>
  makeErrorSchema(
    "CollectionCategoryNotFound",
    v.strictObject({ collectionCategoryId: collectionCategoryId() }),
  );

export const collectionHasDocuments = () =>
  makeErrorSchema(
    "CollectionHasDocuments",
    v.strictObject({ collectionId: collectionId() }),
  );

export const collectionHasNoRemote = () =>
  makeErrorSchema(
    "CollectionHasNoRemote",
    v.strictObject({ collectionId: collectionId() }),
  );

export const collectionIsReferenced = () =>
  makeErrorSchema(
    "CollectionIsReferenced",
    v.strictObject({
      collectionId: collectionId(),
      referencingCollectionIds: v.array(collectionId()),
    }),
  );

export const collectionIsSyncing = () =>
  makeErrorSchema(
    "CollectionIsSyncing",
    v.strictObject({ collectionId: collectionId() }),
  );

export const collectionMigrationFailed = () =>
  makeErrorSchema(
    "CollectionMigrationFailed",
    v.strictObject({
      collectionId: collectionId(),
      failedDocumentMigrations: v.array(
        v.strictObject({
          documentId: documentId(),
          // The cause is a discriminated union of error types — validate it
          // loosely (a name + details object) since the precise shape isn't
          // load-bearing at the boundary.
          cause: resultErrorRecord(),
        }),
      ),
    }) as unknown as v.GenericSchema<
      unknown,
      CollectionMigrationFailed["details"]
    >,
  ) as v.GenericSchema<unknown, CollectionMigrationFailed>;

export const collectionMigrationNotValid = () =>
  makeErrorSchema(
    "CollectionMigrationNotValid",
    v.strictObject({
      collectionId: collectionId(),
      issues: issues(),
    }),
  );

export const collectionNotFound = () =>
  makeErrorSchema(
    "CollectionNotFound",
    v.strictObject({ collectionId: collectionId() }),
  );

export const collectionSchemaNotValid = () =>
  makeErrorSchema(
    "CollectionSchemaNotValid",
    v.strictObject({
      collectionId: v.nullable(v.union([collectionId(), protoCollectionId()])),
      issues: issues(),
    }),
  );

export const collectionSettingsNotValid = () =>
  makeErrorSchema(
    "CollectionSettingsNotValid",
    v.strictObject({
      collectionId: v.nullable(collectionId()),
      issues: issues(),
    }),
  );

export const collectionVersionIdNotMatching = () =>
  makeErrorSchema(
    "CollectionVersionIdNotMatching",
    v.strictObject({
      collectionId: collectionId(),
      latestVersionId: collectionVersionId(),
      suppliedVersionId: collectionVersionId(),
    }),
  );

export const collectionVersionNotFound = () =>
  makeErrorSchema(
    "CollectionVersionNotFound",
    v.strictObject({
      collectionId: collectionId(),
      collectionVersionId: collectionVersionId(),
    }),
  );

export const commandConfirmationNotValid = () =>
  makeErrorSchema(
    "CommandConfirmationNotValid",
    v.strictObject({
      suppliedCommandConfirmation: v.string(),
      requiredCommandConfirmation: v.string(),
    }),
  );

export const connectorAuthenticationFailed = () =>
  makeErrorSchema(
    "ConnectorAuthenticationFailed",
    v.strictObject({ cause: v.any() }),
  );

export const connectorAuthenticationSettingsNotValid = () =>
  makeErrorSchema(
    "ConnectorAuthenticationSettingsNotValid",
    v.strictObject({
      collectionId: collectionId(),
      connectorName: v.string(),
      issues: issues(),
    }),
  );

export const connectorDoesNotSupportUpSyncing = () =>
  makeErrorSchema(
    "ConnectorDoesNotSupportUpSyncing",
    v.strictObject({
      collectionId: collectionId(),
      connectorName: v.string(),
      message: v.string(),
    }),
  );

export const connectorDoesNotUseOAuth2PKCEAuthenticationStrategy = () =>
  makeErrorSchema(
    "ConnectorDoesNotUseOAuth2PKCEAuthenticationStrategy",
    v.strictObject({
      collectionId: collectionId(),
      connectorName: v.string(),
    }),
  );

export const connectorNotAuthenticated = () =>
  makeErrorSchema(
    "ConnectorNotAuthenticated",
    v.strictObject({
      collectionId: collectionId(),
      connectorName: v.string(),
    }),
  );

export const connectorNotFound = () =>
  makeErrorSchema(
    "ConnectorNotFound",
    v.strictObject({
      collectionId: collectionId(),
      connectorName: v.string(),
    }),
  );

export const connectorSettingsNotValid = () =>
  makeErrorSchema(
    "ConnectorSettingsNotValid",
    v.strictObject({
      connectorName: v.string(),
      issues: issues(),
    }),
  );

export const contentBlockingKeysGetterNotValid = () =>
  makeErrorSchema(
    "ContentBlockingKeysGetterNotValid",
    v.strictObject({
      collectionId: v.nullable(collectionId()),
      collectionVersionId: v.nullable(collectionVersionId()),
      issues: issues(),
    }),
  );

export const contentSummaryGetterNotValid = () =>
  makeErrorSchema(
    "ContentSummaryGetterNotValid",
    v.strictObject({
      collectionId: v.nullable(collectionId()),
      collectionVersionId: v.nullable(collectionVersionId()),
      issues: issues(),
    }),
  );

export const contentSummaryNotValid = () =>
  makeErrorSchema(
    "ContentSummaryNotValid",
    v.strictObject({
      collectionId: collectionId(),
      collectionVersionId: collectionVersionId(),
      documentId: documentId(),
      documentVersionId: documentVersionId(),
      issues: issues(),
    }),
  );

export const conversationNotFound = () =>
  makeErrorSchema(
    "ConversationNotFound",
    v.strictObject({ conversationId: conversationId() }),
  );

export const conversationStatusNotProcessing = () =>
  makeErrorSchema(
    "ConversationStatusNotProcessing",
    v.strictObject({ conversationId: conversationId() }),
  );

export const defaultDocumentViewUiOptionsNotValid = () =>
  makeErrorSchema(
    "DefaultDocumentViewUiOptionsNotValid",
    v.strictObject({
      collectionId: v.nullable(collectionId()),
      collectionVersionId: v.nullable(collectionVersionId()),
      issues: issues(),
    }),
  );

export const documentContentNotValid = () =>
  makeErrorSchema(
    "DocumentContentNotValid",
    v.strictObject({
      collectionId: collectionId(),
      collectionVersionId: collectionVersionId(),
      documentId: v.nullable(documentId()),
      issues: issues(),
    }),
  );

const documentRefSchema = () =>
  v.strictObject({
    collectionId: v.string(),
    documentId: v.string(),
  });

export const documentIsReferenced = () =>
  makeErrorSchema(
    "DocumentIsReferenced",
    v.strictObject({
      documentId: documentId(),
      collectionId: collectionId(),
      referencingDocuments: v.array(documentRefSchema()),
    }),
  );

export const documentNotFound = () =>
  makeErrorSchema(
    "DocumentNotFound",
    v.strictObject({ documentId: documentId() }),
  );

export const documentVersionIdNotMatching = () =>
  makeErrorSchema(
    "DocumentVersionIdNotMatching",
    v.strictObject({
      documentId: documentId(),
      latestVersionId: documentVersionId(),
      suppliedVersionId: documentVersionId(),
    }),
  );

export const documentVersionNotFound = () =>
  makeErrorSchema(
    "DocumentVersionNotFound",
    v.strictObject({
      collectionId: collectionId(),
      documentId: documentId(),
      documentVersionId: documentVersionId(),
    }),
  );

export const duplicateDocumentDetected = () =>
  // The duplicate document is the full Document type. Validating it deeply
  // here would create a circular import (document schemas pull errors). Use a
  // loose object instead — the structural correctness is verified by the
  // makeUsecase result-validation step on the success branch.
  makeErrorSchema(
    "DuplicateDocumentDetected",
    v.strictObject({
      collectionId: collectionId(),
      duplicateDocument: v.looseObject({}),
    }) as unknown as v.GenericSchema<
      unknown,
      DuplicateDocumentDetected["details"]
    >,
  ) as v.GenericSchema<unknown, DuplicateDocumentDetected>;

export const executingJavascriptFunctionFailed = () =>
  makeErrorSchema(
    "ExecutingJavascriptFunctionFailed",
    v.strictObject({
      message: v.string(),
      name: v.optional(v.string()),
      stack: v.optional(v.string()),
    }),
  );

export const fileNotFound = () =>
  makeErrorSchema("FileNotFound", v.strictObject({ fileId: fileId() }));

export const filesNotFound = () =>
  makeErrorSchema(
    "FilesNotFound",
    v.strictObject({ fileIds: v.array(fileId()) }),
  );

export const globalSettingsNotValid = () =>
  makeErrorSchema(
    "GlobalSettingsNotValid",
    v.strictObject({ issues: issues() }),
  );

export const inferenceOptionsNotValid = () =>
  makeErrorSchema(
    "InferenceOptionsNotValid",
    v.strictObject({ issues: issues() }),
  );

export const makingContentBlockingKeysFailed = () =>
  makeErrorSchema(
    "MakingContentBlockingKeysFailed",
    v.strictObject({
      collectionId: collectionId(),
      collectionVersionId: collectionVersionId(),
      documentId: v.nullable(documentId()),
      cause: resultErrorRecord(),
    }) as unknown as v.GenericSchema<
      unknown,
      MakingContentBlockingKeysFailed["details"]
    >,
  ) as v.GenericSchema<unknown, MakingContentBlockingKeysFailed>;

export const packNotFound = () =>
  makeErrorSchema("PackNotFound", v.strictObject({ packId: packId() }));

export const packNotValid = () =>
  makeErrorSchema("PackNotValid", v.strictObject({ issues: issues() }));

export const parentCollectionCategoryIsDescendant = () =>
  makeErrorSchema(
    "ParentCollectionCategoryIsDescendant",
    v.strictObject({ parentId: collectionCategoryId() }),
  );

export const parentCollectionCategoryNotFound = () =>
  makeErrorSchema(
    "ParentCollectionCategoryNotFound",
    v.strictObject({ parentId: collectionCategoryId() }),
  );

export const referencedCollectionsNotFound = () =>
  makeErrorSchema(
    "ReferencedCollectionsNotFound",
    v.strictObject({
      collectionId: v.nullable(collectionId()),
      notFoundCollectionIds: v.array(v.string()),
    }),
  );

export const referencedDocumentsNotFound = () =>
  makeErrorSchema(
    "ReferencedDocumentsNotFound",
    v.strictObject({
      collectionId: collectionId(),
      documentId: v.nullable(documentId()),
      notFoundDocumentRefs: v.array(documentRefSchema()),
    }),
  );

export const remoteConvertersNotValid = () =>
  makeErrorSchema(
    "RemoteConvertersNotValid",
    v.strictObject({
      collectionId: collectionId(),
      issues: issues(),
    }),
  );

export const syncingChangesFailed = () =>
  makeErrorSchema(
    "SyncingChangesFailed",
    v.strictObject({
      collectionId: collectionId(),
      errors: v.array(resultErrorRecord()),
    }),
  );

export const tooManyFailedImplementationAttempts = () =>
  makeErrorSchema(
    "TooManyFailedImplementationAttempts",
    v.strictObject({ failedAttemptsCount: v.number() }),
  );

export const typescriptCompilationFailed = () =>
  makeErrorSchema(
    "TypescriptCompilationFailed",
    v.union([
      v.strictObject({
        reason: v.literal("TypeErrors"),
        errors: v.string(),
      }),
      v.strictObject({
        reason: v.literal("MissingOutput"),
      }),
    ]),
  );

export const unexpectedError = () =>
  makeErrorSchema("UnexpectedError", v.strictObject({ cause: v.any() }));

export const writeTypescriptModuleToolNotCalled = () =>
  makeErrorSchema(
    "WriteTypescriptModuleToolNotCalled",
    // generatedMessage is a Message — see comment on duplicateDocumentDetected.
    v.strictObject({
      generatedMessage: v.looseObject({}),
    }) as unknown as v.GenericSchema<unknown, { generatedMessage: Message }>,
  ) as v.GenericSchema<
    unknown,
    ResultError<
      "WriteTypescriptModuleToolNotCalled",
      { generatedMessage: Message }
    >
  >;
