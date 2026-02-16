import type {
  AppNameNotValid,
  AppNotFound,
  CannotChangeCollectionRemoteConnector,
  CannotContinueConversation,
  CannotRecoverConversation,
  CannotRetryLastResponse,
  CollectionCategoryHasChildren,
  CollectionCategoryIconNotValid,
  CollectionCategoryNameNotValid,
  CollectionCategoryNotFound,
  CollectionHasDocuments,
  CollectionHasNoRemote,
  CollectionIsReferenced,
  CollectionIsSyncing,
  CollectionMigrationFailed,
  CollectionMigrationNotValid,
  CollectionNotFound,
  CollectionSchemaNotValid,
  CollectionSettingsNotValid,
  CollectionVersionIdNotMatching,
  CollectionVersionNotFound,
  CommandConfirmationNotValid,
  ConnectorAuthenticationFailed,
  ConnectorAuthenticationSettingsNotValid,
  ConnectorDoesNotSupportUpSyncing,
  ConnectorDoesNotUseOAuth2PKCEAuthenticationStrategy,
  ConnectorNotAuthenticated,
  ConnectorNotFound,
  ConnectorSettingsNotValid,
  ContentBlockingKeysGetterNotValid,
  ContentSummaryGetterNotValid,
  ContentSummaryNotValid,
  ConversationNotFound,
  ConversationStatusNotProcessing,
  DefaultDocumentViewUiOptionsNotValid,
  DocumentContentNotValid,
  DocumentIsReferenced,
  DocumentNotFound,
  DocumentVersionIdNotMatching,
  DocumentVersionNotFound,
  DuplicateDocumentDetected,
  ExecutingJavascriptFunctionFailed,
  FileNotFound,
  FilesNotFound,
  MakingContentBlockingKeysFailed,
  PackNotFound,
  PackNotValid,
  ParentCollectionCategoryIsDescendant,
  ParentCollectionCategoryNotFound,
  ReferencedCollectionsNotFound,
  ReferencedDocumentsNotFound,
  RemoteConvertersNotValid,
  SyncingChangesFailed,
  TooManyFailedImplementationAttempts,
  TypescriptCompilationFailed,
  UnexpectedError,
  WriteTypescriptModuleToolNotCalled,
} from "@superego/backend";

type KnownResultError =
  | AppNameNotValid
  | AppNotFound
  | CannotChangeCollectionRemoteConnector
  | CannotContinueConversation
  | CannotRecoverConversation
  | CannotRetryLastResponse
  | CollectionCategoryHasChildren
  | CollectionCategoryIconNotValid
  | CollectionCategoryNameNotValid
  | CollectionCategoryNotFound
  | CollectionHasDocuments
  | CollectionHasNoRemote
  | CollectionIsReferenced
  | CollectionIsSyncing
  | CollectionMigrationFailed
  | CollectionMigrationNotValid
  | CollectionNotFound
  | CollectionSchemaNotValid
  | CollectionSettingsNotValid
  | CollectionVersionIdNotMatching
  | CollectionVersionNotFound
  | CommandConfirmationNotValid
  | ConnectorAuthenticationFailed
  | ConnectorAuthenticationSettingsNotValid
  | ConnectorDoesNotSupportUpSyncing
  | ConnectorDoesNotUseOAuth2PKCEAuthenticationStrategy
  | ConnectorNotAuthenticated
  | ConnectorNotFound
  | ConnectorSettingsNotValid
  | ContentBlockingKeysGetterNotValid
  | ContentSummaryGetterNotValid
  | ContentSummaryNotValid
  | DefaultDocumentViewUiOptionsNotValid
  | ConversationNotFound
  | ConversationStatusNotProcessing
  | DocumentContentNotValid
  | DocumentIsReferenced
  | DocumentNotFound
  | DocumentVersionIdNotMatching
  | DocumentVersionNotFound
  | DuplicateDocumentDetected
  | ExecutingJavascriptFunctionFailed
  | FileNotFound
  | FilesNotFound
  | MakingContentBlockingKeysFailed
  | PackNotFound
  | PackNotValid
  | ParentCollectionCategoryIsDescendant
  | ParentCollectionCategoryNotFound
  | ReferencedCollectionsNotFound
  | ReferencedDocumentsNotFound
  | RemoteConvertersNotValid
  | SyncingChangesFailed
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
