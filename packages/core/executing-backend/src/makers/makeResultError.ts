import type {
  AppNameNotValid,
  AppNotFound,
  ArgumentsNotValid,
  CannotContinueConversation,
  CannotRecoverConversation,
  CannotRetryLastResponse,
  CannotTranscribeAudioMessage,
  CollectionCategoryHasChildren,
  CollectionCategoryIconNotValid,
  CollectionCategoryNameNotValid,
  CollectionCategoryNotFound,
  CollectionIsReferenced,
  CollectionMigrationFailed,
  CollectionMigrationNotValid,
  CollectionNotFound,
  CollectionSchemaNotValid,
  CollectionSettingsNotValid,
  CollectionVersionIdNotMatching,
  CollectionVersionNotFound,
  CommandConfirmationNotValid,
  ContentBlockingKeysGetterNotValid,
  ContentSummaryGetterNotValid,
  ContentSummaryNotValid,
  ConversationNotFound,
  ConversationStatusNotProcessing,
  DefaultDocumentViewUiOptionsNotValid,
  DocumentContentPatchNotApplicable,
  DocumentContentNotValid,
  DocumentIsReferenced,
  DocumentNotFound,
  DocumentVersionIdNotMatching,
  DocumentVersionNotFound,
  DuplicateDocumentDetected,
  ExecutingTypescriptFunctionFailed,
  FileNotFound,
  FilesNotFound,
  GlobalSettingsNotValid,
  InferenceOptionsNotValid,
  MakingContentBlockingKeysFailed,
  PackNotFound,
  PackNotValid,
  ParentCollectionCategoryIsDescendant,
  ParentCollectionCategoryNotFound,
  ReferencedCollectionsNotFound,
  ReferencedDocumentsNotFound,
  TooManyFailedImplementationAttempts,
  TypescriptCompilationFailed,
  UnexpectedError,
  WriteTypescriptModuleToolNotCalled,
} from "@superego/backend";

type KnownResultError =
  | AppNameNotValid
  | AppNotFound
  | ArgumentsNotValid
  | CannotContinueConversation
  | CannotRecoverConversation
  | CannotRetryLastResponse
  | CannotTranscribeAudioMessage
  | CollectionCategoryHasChildren
  | CollectionCategoryIconNotValid
  | CollectionCategoryNameNotValid
  | CollectionCategoryNotFound
  | CollectionIsReferenced
  | CollectionMigrationFailed
  | CollectionMigrationNotValid
  | CollectionNotFound
  | CollectionSchemaNotValid
  | CollectionSettingsNotValid
  | CollectionVersionIdNotMatching
  | CollectionVersionNotFound
  | CommandConfirmationNotValid
  | ContentBlockingKeysGetterNotValid
  | ContentSummaryGetterNotValid
  | ContentSummaryNotValid
  | DefaultDocumentViewUiOptionsNotValid
  | DocumentContentPatchNotApplicable
  | ConversationNotFound
  | ConversationStatusNotProcessing
  | DocumentContentNotValid
  | DocumentIsReferenced
  | DocumentNotFound
  | DocumentVersionIdNotMatching
  | DocumentVersionNotFound
  | DuplicateDocumentDetected
  | ExecutingTypescriptFunctionFailed
  | FileNotFound
  | FilesNotFound
  | GlobalSettingsNotValid
  | InferenceOptionsNotValid
  | MakingContentBlockingKeysFailed
  | PackNotFound
  | PackNotValid
  | ParentCollectionCategoryIsDescendant
  | ParentCollectionCategoryNotFound
  | ReferencedCollectionsNotFound
  | ReferencedDocumentsNotFound
  | TooManyFailedImplementationAttempts
  | TypescriptCompilationFailed
  | UnexpectedError
  | WriteTypescriptModuleToolNotCalled;

export default function makeResultError<Name extends string, Details>(
  name: Name,
  details: Name extends KnownResultError["name"]
    ? Extract<KnownResultError, { name: Name }>["details"]
    : Details,
) {
  return { name, details };
}
