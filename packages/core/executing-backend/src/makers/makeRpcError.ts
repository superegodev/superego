import type {
  CannotContinueConversation,
  CannotRecoverConversation,
  CollectionCategoryHasChildren,
  CollectionCategoryIconNotValid,
  CollectionCategoryNameNotValid,
  CollectionCategoryNotFound,
  CollectionMigrationFailed,
  CollectionMigrationNotValid,
  CollectionNotFound,
  CollectionSchemaNotValid,
  CollectionSettingsNotValid,
  CollectionSummaryPropertiesNotValid,
  CollectionVersionIdNotMatching,
  CommandConfirmationNotValid,
  ConversationNotFound,
  DocumentContentNotValid,
  DocumentNotFound,
  DocumentVersionIdNotMatching,
  FileNotFound,
  FilesNotFound,
  ParentCollectionCategoryIsDescendant,
  ParentCollectionCategoryNotFound,
  UnexpectedError,
} from "@superego/backend";

type KnownRpcError =
  | CannotContinueConversation
  | CannotRecoverConversation
  | CollectionCategoryHasChildren
  | CollectionCategoryIconNotValid
  | CollectionCategoryNameNotValid
  | CollectionCategoryNotFound
  | CollectionMigrationFailed
  | CollectionMigrationNotValid
  | CollectionSettingsNotValid
  | CollectionNotFound
  | CollectionSchemaNotValid
  | CollectionSummaryPropertiesNotValid
  | CollectionVersionIdNotMatching
  | CommandConfirmationNotValid
  | ConversationNotFound
  | DocumentContentNotValid
  | DocumentVersionIdNotMatching
  | DocumentNotFound
  | FileNotFound
  | FilesNotFound
  | ParentCollectionCategoryIsDescendant
  | ParentCollectionCategoryNotFound
  | UnexpectedError;

export default function makeRpcError<Name extends KnownRpcError["name"]>(
  name: Name,
  details: Extract<KnownRpcError, { name: Name }>["details"],
): Extract<KnownRpcError, { name: Name }> {
  return { name, details } as Extract<KnownRpcError, { name: Name }>;
}
