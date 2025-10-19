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
  CollectionIsSyncing,
  CollectionMigrationFailed,
  CollectionMigrationNotValid,
  CollectionNotFound,
  CollectionSchemaNotValid,
  CollectionSettingsNotValid,
  CollectionVersionIdNotMatching,
  CommandConfirmationNotValid,
  ConnectorAuthenticationFailed,
  ConnectorAuthenticationSettingsNotValid,
  ConnectorDoesNotSupportUpSyncing,
  ConnectorDoesNotUseOAuth2PKCEAuthenticationStrategy,
  ConnectorNotAuthenticated,
  ConnectorNotFound,
  ConnectorSettingsNotValid,
  ContentSummaryGetterNotValid,
  ContentSummaryNotValid,
  ConversationNotFound,
  ConversationStatusNotProcessing,
  DocumentContentNotValid,
  DocumentNotFound,
  DocumentVersionIdNotMatching,
  DocumentVersionNotFound,
  ExecutingJavascriptFunctionFailed,
  FileNotFound,
  FilesNotFound,
  ParentCollectionCategoryIsDescendant,
  ParentCollectionCategoryNotFound,
  RemoteConvertersNotValid,
  SyncingChangesFailed,
  UnexpectedError,
  WriteTypescriptFunctionToolNotCalled,
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
  | CollectionIsSyncing
  | CollectionMigrationFailed
  | CollectionMigrationNotValid
  | CollectionNotFound
  | CollectionSchemaNotValid
  | CollectionSettingsNotValid
  | CollectionVersionIdNotMatching
  | CommandConfirmationNotValid
  | ConnectorAuthenticationFailed
  | ConnectorAuthenticationSettingsNotValid
  | ConnectorDoesNotSupportUpSyncing
  | ConnectorDoesNotUseOAuth2PKCEAuthenticationStrategy
  | ConnectorNotAuthenticated
  | ConnectorNotFound
  | ConnectorSettingsNotValid
  | ContentSummaryGetterNotValid
  | ContentSummaryNotValid
  | ConversationNotFound
  | ConversationStatusNotProcessing
  | DocumentContentNotValid
  | DocumentNotFound
  | DocumentVersionIdNotMatching
  | DocumentVersionNotFound
  | ExecutingJavascriptFunctionFailed
  | FileNotFound
  | FilesNotFound
  | ParentCollectionCategoryIsDescendant
  | ParentCollectionCategoryNotFound
  | RemoteConvertersNotValid
  | SyncingChangesFailed
  | UnexpectedError
  | WriteTypescriptFunctionToolNotCalled;

export default function makeResultError<Name extends string, Details>(
  name: Name,
  details: Name extends KnownResultError["name"]
    ? Extract<KnownResultError, { name: Name }>["details"]
    : Details,
) {
  return { name, details };
}
