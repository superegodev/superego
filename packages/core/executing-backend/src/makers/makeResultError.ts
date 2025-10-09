import type {
  CannotChangeCollectionRemoteConnector,
  CannotContinueConversation,
  CannotRecoverConversation,
  CannotRetryLastResponse,
  CollectionCategoryHasChildren,
  CollectionCategoryIconNotValid,
  CollectionCategoryNameNotValid,
  CollectionCategoryNotFound,
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
  ConnectorDoesNotUseOAuth2PKCEAuthenticationStrategy,
  ConnectorNotAuthenticated,
  ConnectorNotFound,
  ConnectorSettingsNotValid,
  ContentSummaryGetterNotValid,
  ContentSummaryNotValid,
  ConversationNotFound,
  ConversationStatusNotProcessing,
  DocumentContentNotValid,
  DocumentIsRemote,
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
} from "@superego/backend";

type KnownResultError =
  | CannotChangeCollectionRemoteConnector
  | CannotContinueConversation
  | CannotRecoverConversation
  | CannotRetryLastResponse
  | CollectionCategoryHasChildren
  | CollectionCategoryIconNotValid
  | CollectionCategoryNameNotValid
  | CollectionCategoryNotFound
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
  | ConnectorDoesNotUseOAuth2PKCEAuthenticationStrategy
  | ConnectorNotAuthenticated
  | ConnectorNotFound
  | ConnectorSettingsNotValid
  | ContentSummaryGetterNotValid
  | ContentSummaryNotValid
  | ConversationNotFound
  | ConversationStatusNotProcessing
  | DocumentContentNotValid
  | DocumentIsRemote
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
  | UnexpectedError;

export default function makeResultError<Name extends string, Details>(
  name: Name,
  details: Name extends KnownResultError["name"]
    ? Extract<KnownResultError, { name: Name }>["details"]
    : Details,
) {
  return { name, details };
}
