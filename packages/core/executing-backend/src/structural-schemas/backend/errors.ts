import type {
  CollectionMigrationFailed,
  DuplicateDocumentDetected,
  MakingContentBlockingKeysFailed,
  Message,
} from "@superego/backend";
import type { ResultError } from "@superego/global-types";
import * as v from "valibot";
import resultError from "../global/resultError.js";
import unknownResultError from "../global/unknownResultError.js";
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
} from "./ids.js";
import { message } from "./types/conversation.js";
import { document } from "./types/document.js";
import validationIssue from "./types/issue.js";

const issues = () => v.array(validationIssue());

export const appNameNotValid = () =>
  resultError(
    "AppNameNotValid",
    v.strictObject({
      appId: v.nullable(appId()),
      issues: issues(),
    }),
  );

export const appNotFound = () =>
  resultError("AppNotFound", v.strictObject({ appId: appId() }));

export const backgroundJobNotFound = () =>
  resultError(
    "BackgroundJobNotFound",
    v.strictObject({ backgroundJobId: backgroundJobId() }),
  );

export const cannotContinueConversation = () =>
  resultError(
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
  resultError(
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
  resultError(
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

export const collectionCategoryHasChildren = () =>
  resultError(
    "CollectionCategoryHasChildren",
    v.strictObject({ collectionCategoryId: collectionCategoryId() }),
  );

export const collectionCategoryIconNotValid = () =>
  resultError(
    "CollectionCategoryIconNotValid",
    v.strictObject({
      collectionCategoryId: v.nullable(collectionCategoryId()),
      issues: issues(),
    }),
  );

export const collectionCategoryNameNotValid = () =>
  resultError(
    "CollectionCategoryNameNotValid",
    v.strictObject({
      collectionCategoryId: v.nullable(collectionCategoryId()),
      issues: issues(),
    }),
  );

export const collectionCategoryNotFound = () =>
  resultError(
    "CollectionCategoryNotFound",
    v.strictObject({ collectionCategoryId: collectionCategoryId() }),
  );

export const collectionIsReferenced = () =>
  resultError(
    "CollectionIsReferenced",
    v.strictObject({
      collectionId: collectionId(),
      referencingCollectionIds: v.array(collectionId()),
    }),
  );

export const collectionMigrationFailed = () =>
  resultError(
    "CollectionMigrationFailed",
    v.strictObject({
      collectionId: collectionId(),
      failedDocumentMigrations: v.array(
        v.strictObject({
          documentId: documentId(),
          // The cause is a discriminated union of error types. Validate the
          // ResultError envelope here; the precise details shape is not
          // load-bearing at the boundary.
          cause: unknownResultError(),
        }),
      ),
    }) as unknown as v.GenericSchema<
      unknown,
      CollectionMigrationFailed["details"]
    >,
  ) as v.GenericSchema<unknown, CollectionMigrationFailed>;

export const collectionMigrationNotValid = () =>
  resultError(
    "CollectionMigrationNotValid",
    v.strictObject({
      collectionId: collectionId(),
      issues: issues(),
    }),
  );

export const collectionNotFound = () =>
  resultError(
    "CollectionNotFound",
    v.strictObject({ collectionId: collectionId() }),
  );

export const collectionSchemaNotValid = () =>
  resultError(
    "CollectionSchemaNotValid",
    v.strictObject({
      collectionId: v.nullable(v.union([collectionId(), protoCollectionId()])),
      issues: issues(),
    }),
  );

export const collectionSettingsNotValid = () =>
  resultError(
    "CollectionSettingsNotValid",
    v.strictObject({
      collectionId: v.nullable(collectionId()),
      issues: issues(),
    }),
  );

export const collectionVersionIdNotMatching = () =>
  resultError(
    "CollectionVersionIdNotMatching",
    v.strictObject({
      collectionId: collectionId(),
      latestVersionId: collectionVersionId(),
      suppliedVersionId: collectionVersionId(),
    }),
  );

export const collectionVersionNotFound = () =>
  resultError(
    "CollectionVersionNotFound",
    v.strictObject({
      collectionId: collectionId(),
      collectionVersionId: collectionVersionId(),
    }),
  );

export const commandConfirmationNotValid = () =>
  resultError(
    "CommandConfirmationNotValid",
    v.strictObject({
      suppliedCommandConfirmation: v.string(),
      requiredCommandConfirmation: v.string(),
    }),
  );

export const contentBlockingKeysGetterNotValid = () =>
  resultError(
    "ContentBlockingKeysGetterNotValid",
    v.strictObject({
      collectionId: v.nullable(collectionId()),
      collectionVersionId: v.nullable(collectionVersionId()),
      issues: issues(),
    }),
  );

export const contentSummaryGetterNotValid = () =>
  resultError(
    "ContentSummaryGetterNotValid",
    v.strictObject({
      collectionId: v.nullable(collectionId()),
      collectionVersionId: v.nullable(collectionVersionId()),
      issues: issues(),
    }),
  );

export const conversationNotFound = () =>
  resultError(
    "ConversationNotFound",
    v.strictObject({ conversationId: conversationId() }),
  );

export const defaultDocumentViewUiOptionsNotValid = () =>
  resultError(
    "DefaultDocumentViewUiOptionsNotValid",
    v.strictObject({
      collectionId: v.nullable(collectionId()),
      collectionVersionId: v.nullable(collectionVersionId()),
      issues: issues(),
    }),
  );

export const documentContentNotValid = () =>
  resultError(
    "DocumentContentNotValid",
    v.strictObject({
      collectionId: collectionId(),
      collectionVersionId: collectionVersionId(),
      documentId: v.nullable(documentId()),
      issues: issues(),
    }),
  );

export const documentContentPatchNotApplicable = () =>
  resultError(
    "DocumentContentPatchNotApplicable",
    v.strictObject({
      collectionId: collectionId(),
      documentId: documentId(),
      latestVersionId: documentVersionId(),
      operationIndex: v.nullable(v.number()),
      path: v.nullable(v.string()),
      cause: v.string(),
    }),
  );

const documentRefSchema = () =>
  v.strictObject({
    collectionId: v.string(),
    documentId: v.string(),
  });

export const documentIsReferenced = () =>
  resultError(
    "DocumentIsReferenced",
    v.strictObject({
      documentId: documentId(),
      collectionId: collectionId(),
      referencingDocuments: v.array(documentRefSchema()),
    }),
  );

export const documentNotFound = () =>
  resultError("DocumentNotFound", v.strictObject({ documentId: documentId() }));

export const documentVersionIdNotMatching = () =>
  resultError(
    "DocumentVersionIdNotMatching",
    v.strictObject({
      documentId: documentId(),
      latestVersionId: documentVersionId(),
      suppliedVersionId: documentVersionId(),
    }),
  );

export const documentVersionNotFound = () =>
  resultError(
    "DocumentVersionNotFound",
    v.strictObject({
      collectionId: collectionId(),
      documentId: documentId(),
      documentVersionId: documentVersionId(),
    }),
  );

export const duplicateDocumentDetected = () =>
  resultError(
    "DuplicateDocumentDetected",
    v.strictObject({
      collectionId: collectionId(),
      duplicateDocument: document(),
    }) as unknown as v.GenericSchema<
      unknown,
      DuplicateDocumentDetected["details"]
    >,
  ) as v.GenericSchema<unknown, DuplicateDocumentDetected>;

export const executingTypescriptFunctionFailed = () =>
  resultError(
    "ExecutingTypescriptFunctionFailed",
    v.strictObject({
      message: v.string(),
      name: v.optional(v.string()),
      stack: v.optional(v.string()),
    }),
  );

export const fileNotFound = () =>
  resultError("FileNotFound", v.strictObject({ fileId: fileId() }));

export const filesNotFound = () =>
  resultError("FilesNotFound", v.strictObject({ fileIds: v.array(fileId()) }));

export const globalSettingsNotValid = () =>
  resultError("GlobalSettingsNotValid", v.strictObject({ issues: issues() }));

export const inferenceOptionsNotValid = () =>
  resultError("InferenceOptionsNotValid", v.strictObject({ issues: issues() }));

export const makingContentBlockingKeysFailed = () =>
  resultError(
    "MakingContentBlockingKeysFailed",
    v.strictObject({
      collectionId: collectionId(),
      collectionVersionId: collectionVersionId(),
      documentId: v.nullable(documentId()),
      cause: unknownResultError(),
    }) as unknown as v.GenericSchema<
      unknown,
      MakingContentBlockingKeysFailed["details"]
    >,
  ) as v.GenericSchema<unknown, MakingContentBlockingKeysFailed>;

export const packNotFound = () =>
  resultError("PackNotFound", v.strictObject({ packId: packId() }));

export const packNotValid = () =>
  resultError("PackNotValid", v.strictObject({ issues: issues() }));

export const parentCollectionCategoryIsDescendant = () =>
  resultError(
    "ParentCollectionCategoryIsDescendant",
    v.strictObject({ parentId: collectionCategoryId() }),
  );

export const parentCollectionCategoryNotFound = () =>
  resultError(
    "ParentCollectionCategoryNotFound",
    v.strictObject({ parentId: collectionCategoryId() }),
  );

export const referencedCollectionsNotFound = () =>
  resultError(
    "ReferencedCollectionsNotFound",
    v.strictObject({
      collectionId: v.nullable(collectionId()),
      notFoundCollectionIds: v.array(v.string()),
    }),
  );

export const referencedDocumentsNotFound = () =>
  resultError(
    "ReferencedDocumentsNotFound",
    v.strictObject({
      collectionId: collectionId(),
      documentId: v.nullable(documentId()),
      notFoundDocumentRefs: v.array(documentRefSchema()),
    }),
  );

export const tooManyFailedImplementationAttempts = () =>
  resultError(
    "TooManyFailedImplementationAttempts",
    v.strictObject({ failedAttemptsCount: v.number() }),
  );

export const typescriptCompilationFailed = () =>
  resultError(
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
  resultError("UnexpectedError", v.strictObject({ cause: v.any() }));

export const writeTypescriptModuleToolNotCalled = () =>
  resultError(
    "WriteTypescriptModuleToolNotCalled",
    v.strictObject({
      generatedMessage: message(),
    }) as unknown as v.GenericSchema<unknown, { generatedMessage: Message }>,
  ) as v.GenericSchema<
    unknown,
    ResultError<
      "WriteTypescriptModuleToolNotCalled",
      { generatedMessage: Message }
    >
  >;
