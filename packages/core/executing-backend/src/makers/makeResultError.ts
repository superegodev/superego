import type {
  CannotContinueConversation,
  CannotProcessConversation,
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
  DocumentVersionNotFound,
  FileNotFound,
  FilesNotFound,
  ParentCollectionCategoryIsDescendant,
  ParentCollectionCategoryNotFound,
  UnexpectedError,
} from "@superego/backend";

type KnownResultError =
  | CannotContinueConversation
  | CannotProcessConversation
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
  | DocumentVersionNotFound
  | FileNotFound
  | FilesNotFound
  | ParentCollectionCategoryIsDescendant
  | ParentCollectionCategoryNotFound
  | UnexpectedError;

export default function makeResultError<Name extends string>(
  name: Name,
  details: Name extends KnownResultError["name"]
    ? Extract<KnownResultError, { name: Name }>["details"]
    : any,
) {
  return { name, details };
}
