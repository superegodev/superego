import type {
  CannotContinueConversation,
  CannotRecoverConversation,
  CannotRetryLastResponse,
  CollectionCategoryHasChildren,
  CollectionCategoryIconNotValid,
  CollectionCategoryNameNotValid,
  CollectionCategoryNotFound,
  CollectionMigrationFailed,
  CollectionMigrationNotValid,
  CollectionNotFound,
  CollectionSchemaNotValid,
  CollectionSettingsNotValid,
  CollectionVersionIdNotMatching,
  CommandConfirmationNotValid,
  ContentSummaryGetterNotValid,
  ContentSummaryNotValid,
  ConversationNotFound,
  ConversationStatusNotProcessing,
  DocumentContentNotValid,
  DocumentNotFound,
  DocumentVersionIdNotMatching,
  DocumentVersionNotFound,
  FileNotFound,
  FilesNotFound,
  ParentCollectionCategoryIsDescendant,
  ParentCollectionCategoryNotFound,
  UnexpectedError,
} from "@superego/backend";

type KnownResultError =
  | CannotContinueConversation
  | CannotRecoverConversation
  | CannotRetryLastResponse
  | CollectionCategoryHasChildren
  | CollectionCategoryIconNotValid
  | CollectionCategoryNameNotValid
  | CollectionCategoryNotFound
  | CollectionMigrationFailed
  | CollectionMigrationNotValid
  | CollectionSettingsNotValid
  | CollectionNotFound
  | CollectionSchemaNotValid
  | CollectionVersionIdNotMatching
  | CommandConfirmationNotValid
  | ContentSummaryGetterNotValid
  | ContentSummaryNotValid
  | ConversationNotFound
  | ConversationStatusNotProcessing
  | DocumentContentNotValid
  | DocumentVersionIdNotMatching
  | DocumentNotFound
  | DocumentVersionNotFound
  | FileNotFound
  | FilesNotFound
  | ParentCollectionCategoryIsDescendant
  | ParentCollectionCategoryNotFound
  | UnexpectedError;

export default function makeResultError<Name extends string, Details>(
  name: Name,
  details: Name extends KnownResultError["name"]
    ? Extract<KnownResultError, { name: Name }>["details"]
    : Details,
) {
  return { name, details };
}
