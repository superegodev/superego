import type { ResultPromise } from "@superego/global-types";
import type { Schema } from "@superego/schema";
import type ConversationFormat from "./enums/ConversationFormat.js";
import type CannotContinueConversation from "./errors/CannotContinueConversation.js";
import type CannotRecoverConversation from "./errors/CannotRecoverConversation.js";
import type CollectionCategoryHasChildren from "./errors/CollectionCategoryHasChildren.js";
import type CollectionCategoryIconNotValid from "./errors/CollectionCategoryIconNotValid.js";
import type CollectionCategoryNameNotValid from "./errors/CollectionCategoryNameNotValid.js";
import type CollectionCategoryNotFound from "./errors/CollectionCategoryNotFound.js";
import type CollectionMigrationFailed from "./errors/CollectionMigrationFailed.js";
import type CollectionMigrationNotValid from "./errors/CollectionMigrationNotValid.js";
import type CollectionNotFound from "./errors/CollectionNotFound.js";
import type CollectionSchemaNotValid from "./errors/CollectionSchemaNotValid.js";
import type CollectionSettingsNotValid from "./errors/CollectionSettingsNotValid.js";
import type CollectionSummaryPropertiesNotValid from "./errors/CollectionSummaryPropertiesNotValid.js";
import type CollectionVersionIdNotMatching from "./errors/CollectionVersionIdNotMatching.js";
import type CommandConfirmationNotValid from "./errors/CommandConfirmationNotValid.js";
import type ConversationNotFound from "./errors/ConversationNotFound.js";
import type DocumentContentNotValid from "./errors/DocumentContentNotValid.js";
import type DocumentNotFound from "./errors/DocumentNotFound.js";
import type DocumentVersionIdNotMatching from "./errors/DocumentVersionIdNotMatching.js";
import type DocumentVersionNotFound from "./errors/DocumentVersionNotFound.js";
import type FileNotFound from "./errors/FileNotFound.js";
import type FilesNotFound from "./errors/FilesNotFound.js";
import type CollectionCategoryIsDescendant from "./errors/ParentCollectionCategoryIsDescendant.js";
import type ParentCollectionCategoryNotFound from "./errors/ParentCollectionCategoryNotFound.js";
import type UnexpectedError from "./errors/UnexpectedError.js";
import type CollectionCategoryId from "./ids/CollectionCategoryId.js";
import type CollectionId from "./ids/CollectionId.js";
import type CollectionVersionId from "./ids/CollectionVersionId.js";
import type ConversationId from "./ids/ConversationId.js";
import type DocumentId from "./ids/DocumentId.js";
import type DocumentVersionId from "./ids/DocumentVersionId.js";
import type FileId from "./ids/FileId.js";
import type BackgroundJob from "./types/BackgroundJob.js";
import type Collection from "./types/Collection.js";
import type CollectionCategory from "./types/CollectionCategory.js";
import type CollectionSettings from "./types/CollectionSettings.js";
import type CollectionVersionSettings from "./types/CollectionVersionSettings.js";
import type Conversation from "./types/Conversation.js";
import type DeletedEntities from "./types/DeletedEntities.js";
import type Document from "./types/Document.js";
import type DocumentVersion from "./types/DocumentVersion.js";
import type GlobalSettings from "./types/GlobalSettings.js";
import type Message from "./types/Message.js";
import type TypescriptModule from "./types/TypescriptModule.js";

export default interface Backend {
  collectionCategories: {
    create(
      proto: Pick<CollectionCategory, "name" | "icon" | "parentId">,
    ): ResultPromise<
      CollectionCategory,
      | CollectionCategoryNameNotValid
      | CollectionCategoryIconNotValid
      | ParentCollectionCategoryNotFound
      | UnexpectedError
    >;

    update(
      id: CollectionCategoryId,
      patch: Partial<Pick<CollectionCategory, "name" | "icon" | "parentId">>,
    ): ResultPromise<
      CollectionCategory,
      | CollectionCategoryNotFound
      | CollectionCategoryNameNotValid
      | CollectionCategoryIconNotValid
      | ParentCollectionCategoryNotFound
      | CollectionCategoryIsDescendant
      | UnexpectedError
    >;

    delete(
      id: CollectionCategoryId,
    ): ResultPromise<
      DeletedEntities,
      | CollectionCategoryNotFound
      | CollectionCategoryHasChildren
      | UnexpectedError
    >;

    list(): ResultPromise<CollectionCategory[], UnexpectedError>;
  };

  collections: {
    create(
      settings: CollectionSettings,
      schema: Schema,
      versionSettings: CollectionVersionSettings,
    ): ResultPromise<
      Collection,
      | CollectionSettingsNotValid
      | CollectionCategoryNotFound
      | CollectionSchemaNotValid
      | CollectionSummaryPropertiesNotValid
      | UnexpectedError
    >;

    updateSettings(
      id: CollectionId,
      settingsPatch: Partial<CollectionSettings>,
    ): ResultPromise<
      Collection,
      | CollectionNotFound
      | CollectionSettingsNotValid
      | CollectionCategoryNotFound
      | UnexpectedError
    >;

    /** Creates a new version for the collection and migrates all documents. */
    createNewVersion(
      id: CollectionId,
      latestVersionId: CollectionVersionId,
      schema: Schema,
      settings: CollectionVersionSettings,
      migration: TypescriptModule,
    ): ResultPromise<
      Collection,
      | CollectionNotFound
      | CollectionVersionIdNotMatching
      | CollectionSchemaNotValid
      | CollectionSummaryPropertiesNotValid
      | CollectionMigrationNotValid
      | CollectionMigrationFailed
      | UnexpectedError
    >;

    updateLatestVersionSettings(
      id: CollectionId,
      latestVersionId: CollectionVersionId,
      settingsPatch: Partial<CollectionVersionSettings>,
    ): ResultPromise<
      Collection,
      | CollectionNotFound
      | CollectionVersionIdNotMatching
      | CollectionSummaryPropertiesNotValid
      | UnexpectedError
    >;

    /**
     * Deleting a collection deletes all of its documents. To prevent either the
     * user or a bug in the client code accidentally triggering this operation,
     * a `commandConfirmation` string needs to be passed to the server. The
     * server checks that the string equals `"delete"` and only then performs
     * the operation.
     */
    delete(
      id: CollectionId,
      commandConfirmation: string,
    ): ResultPromise<
      DeletedEntities,
      CollectionNotFound | CommandConfirmationNotValid | UnexpectedError
    >;

    list(): ResultPromise<Collection[], UnexpectedError>;
  };

  documents: {
    create(
      collectionId: CollectionId,
      content: any,
    ): ResultPromise<
      Document,
      | CollectionNotFound
      | DocumentContentNotValid
      | FilesNotFound
      | UnexpectedError
    >;

    createNewVersion(
      collectionId: CollectionId,
      id: DocumentId,
      latestVersionId: DocumentVersionId,
      content: any,
    ): ResultPromise<
      Document,
      | DocumentNotFound
      | DocumentVersionIdNotMatching
      | DocumentContentNotValid
      | FilesNotFound
      | UnexpectedError
    >;

    /**
     * Deleting a document permanently erases its data and all files associated
     * with it. To prevent either the user or a bug in the client code
     * accidentally triggering this operation, a `commandConfirmation` string
     * needs to be passed to the server. The server checks that the string
     * equals `"delete"` and only then performs the operation.
     */
    delete(
      collectionId: CollectionId,
      id: DocumentId,
      commandConfirmation: string,
    ): ResultPromise<
      DeletedEntities,
      DocumentNotFound | CommandConfirmationNotValid | UnexpectedError
    >;

    list(
      collectionId: CollectionId,
    ): ResultPromise<Document[], CollectionNotFound | UnexpectedError>;

    get(
      collectionId: CollectionId,
      id: DocumentId,
    ): ResultPromise<Document, DocumentNotFound | UnexpectedError>;

    getVersion(
      collectionId: CollectionId,
      documentId: DocumentId,
      documentVersionId: DocumentVersionId,
    ): ResultPromise<
      DocumentVersion,
      DocumentVersionNotFound | UnexpectedError
    >;
  };

  files: {
    getContent(
      collectionId: CollectionId,
      documentId: DocumentId,
      id: FileId,
    ): ResultPromise<Uint8Array<ArrayBuffer>, FileNotFound | UnexpectedError>;
  };

  assistant: {
    startConversation(
      format: ConversationFormat,
      userMessageContent: Message.User["content"],
    ): ResultPromise<Conversation, UnexpectedError>;

    continueConversation(
      id: ConversationId,
      userMessageContent: Message.User["content"],
    ): ResultPromise<
      Conversation,
      ConversationNotFound | CannotContinueConversation | UnexpectedError
    >;

    recoverConversation(
      id: ConversationId,
    ): ResultPromise<
      Conversation,
      ConversationNotFound | CannotRecoverConversation | UnexpectedError
    >;

    deleteConversation(
      id: ConversationId,
      commandConfirmation: string,
    ): ResultPromise<
      DeletedEntities,
      ConversationNotFound | CommandConfirmationNotValid | UnexpectedError
    >;

    listConversations(): ResultPromise<
      Omit<Conversation, "messages">[],
      UnexpectedError
    >;

    getConversation(
      id: ConversationId,
    ): ResultPromise<Conversation, ConversationNotFound | UnexpectedError>;

    // EVOLUTION: tts and stt methods. Possibly in another section (speech).
  };

  backgroundJobs: {
    list(): ResultPromise<BackgroundJob[], UnexpectedError>;
  };

  globalSettings: {
    get(): ResultPromise<GlobalSettings, UnexpectedError>;

    update(
      globalSettingsPatch: Partial<GlobalSettings>,
    ): ResultPromise<GlobalSettings, UnexpectedError>;
  };
}
