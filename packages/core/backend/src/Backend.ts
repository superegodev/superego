import type { ResultPromise } from "@superego/global-types";
import type { Schema } from "@superego/schema";
import type AppType from "./enums/AppType.js";
import type AssistantName from "./enums/AssistantName.js";
import type ConversationFormat from "./enums/ConversationFormat.js";
import type AppNameNotValid from "./errors/AppNameNotValid.js";
import type AppNotFound from "./errors/AppNotFound.js";
import type CannotChangeCollectionRemoteConnector from "./errors/CannotChangeCollectionRemoteConnector.js";
import type CannotContinueConversation from "./errors/CannotContinueConversation.js";
import type CannotRecoverConversation from "./errors/CannotRecoverConversation.js";
import type CannotRetryLastResponse from "./errors/CannotRetryLastResponse.js";
import type CollectionCategoryHasChildren from "./errors/CollectionCategoryHasChildren.js";
import type CollectionCategoryIconNotValid from "./errors/CollectionCategoryIconNotValid.js";
import type CollectionCategoryNameNotValid from "./errors/CollectionCategoryNameNotValid.js";
import type CollectionCategoryNotFound from "./errors/CollectionCategoryNotFound.js";
import type CollectionHasDocuments from "./errors/CollectionHasDocuments.js";
import type CollectionHasNoRemote from "./errors/CollectionHasNoRemote.js";
import type CollectionIsSyncing from "./errors/CollectionIsSyncing.js";
import type CollectionMigrationFailed from "./errors/CollectionMigrationFailed.js";
import type CollectionMigrationNotValid from "./errors/CollectionMigrationNotValid.js";
import type CollectionNotFound from "./errors/CollectionNotFound.js";
import type CollectionSchemaNotValid from "./errors/CollectionSchemaNotValid.js";
import type CollectionSettingsNotValid from "./errors/CollectionSettingsNotValid.js";
import type CollectionVersionIdNotMatching from "./errors/CollectionVersionIdNotMatching.js";
import type CollectionVersionNotFound from "./errors/CollectionVersionNotFound.js";
import type CommandConfirmationNotValid from "./errors/CommandConfirmationNotValid.js";
import type ConnectorAuthenticationSettingsNotValid from "./errors/ConnectorAuthenticationSettingsNotValid.js";
import type ConnectorDoesNotSupportUpSyncing from "./errors/ConnectorDoesNotSupportUpSyncing.js";
import type ConnectorDoesNotUseOAuth2PKCEAuthenticationStrategy from "./errors/ConnectorDoesNotUseOAuth2PKCEAuthenticationStrategy.js";
import type ConnectorNotAuthenticated from "./errors/ConnectorNotAuthenticated.js";
import type ConnectorNotFound from "./errors/ConnectorNotFound.js";
import type ConnectorSettingsNotValid from "./errors/ConnectorSettingsNotValid.js";
import type ContentSummaryGetterNotValid from "./errors/ContentSummaryGetterNotValid.js";
import type ConversationNotFound from "./errors/ConversationNotFound.js";
import type DocumentContentNotValid from "./errors/DocumentContentNotValid.js";
import type DocumentNotFound from "./errors/DocumentNotFound.js";
import type DocumentVersionIdNotMatching from "./errors/DocumentVersionIdNotMatching.js";
import type DocumentVersionNotFound from "./errors/DocumentVersionNotFound.js";
import type FileNotFound from "./errors/FileNotFound.js";
import type FilesNotFound from "./errors/FilesNotFound.js";
import type ParentCollectionCategoryIsDescendant from "./errors/ParentCollectionCategoryIsDescendant.js";
import type ParentCollectionCategoryNotFound from "./errors/ParentCollectionCategoryNotFound.js";
import type RemoteConvertersNotValid from "./errors/RemoteConvertersNotValid.js";
import type TooManyFailedImplementationAttempts from "./errors/TooManyFailedImplementationAttempts.js";
import type UnexpectedError from "./errors/UnexpectedError.js";
import type WriteTypescriptModuleToolNotCalled from "./errors/WriteTypescriptModuleToolNotCalled.js";
import type AppId from "./ids/AppId.js";
import type CollectionCategoryId from "./ids/CollectionCategoryId.js";
import type CollectionId from "./ids/CollectionId.js";
import type CollectionVersionId from "./ids/CollectionVersionId.js";
import type ConversationId from "./ids/ConversationId.js";
import type DocumentId from "./ids/DocumentId.js";
import type DocumentVersionId from "./ids/DocumentVersionId.js";
import type FileId from "./ids/FileId.js";
import type App from "./types/App.js";
import type AppVersion from "./types/AppVersion.js";
import type AudioContent from "./types/AudioContent.js";
import type BackgroundJob from "./types/BackgroundJob.js";
import type Collection from "./types/Collection.js";
import type CollectionCategory from "./types/CollectionCategory.js";
import type CollectionSettings from "./types/CollectionSettings.js";
import type CollectionVersion from "./types/CollectionVersion.js";
import type CollectionVersionSettings from "./types/CollectionVersionSettings.js";
import type Connector from "./types/Connector.js";
import type ConnectorAuthenticationSettings from "./types/ConnectorAuthenticationSettings.js";
import type Conversation from "./types/Conversation.js";
import type DeveloperPrompts from "./types/DeveloperPrompts.js";
import type Document from "./types/Document.js";
import type DocumentVersion from "./types/DocumentVersion.js";
import type GlobalSettings from "./types/GlobalSettings.js";
import type LiteConversation from "./types/LiteConversation.js";
import type LiteDocument from "./types/LiteDocument.js";
import type LiteDocumentVersion from "./types/LiteDocumentVersion.js";
import type Message from "./types/Message.js";
import type RemoteConverters from "./types/RemoteConverters.js";
import type TextSearchResult from "./types/TextSearchResult.js";
import type TypescriptFile from "./types/TypescriptFile.js";
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
      | ParentCollectionCategoryIsDescendant
      | UnexpectedError
    >;

    delete(
      id: CollectionCategoryId,
    ): ResultPromise<
      null,
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
      | AppNotFound
      | CollectionSchemaNotValid
      | ContentSummaryGetterNotValid
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
      | AppNotFound
      | UnexpectedError
    >;

    setRemote(
      id: CollectionId,
      connectorName: string,
      connectorAuthenticationSettings: ConnectorAuthenticationSettings,
      connectorSettings: any,
      remoteConverters: RemoteConverters,
    ): ResultPromise<
      Collection,
      | CollectionNotFound
      | CollectionHasDocuments
      | ConnectorNotFound
      | CannotChangeCollectionRemoteConnector
      | ConnectorAuthenticationSettingsNotValid
      | ConnectorSettingsNotValid
      | RemoteConvertersNotValid
      | UnexpectedError
    >;

    getOAuth2PKCEConnectorAuthorizationRequestUrl(
      id: CollectionId,
    ): ResultPromise<
      string,
      | CollectionNotFound
      | CollectionHasNoRemote
      | ConnectorDoesNotUseOAuth2PKCEAuthenticationStrategy
      | UnexpectedError
    >;

    authenticateOAuth2PKCEConnector(
      id: CollectionId,
      authorizationResponseUrl: string,
    ): ResultPromise<
      Collection,
      | CollectionNotFound
      | CollectionHasNoRemote
      | ConnectorDoesNotUseOAuth2PKCEAuthenticationStrategy
      | UnexpectedError
    >;

    triggerDownSync(
      id: CollectionId,
    ): ResultPromise<
      Collection,
      | CollectionNotFound
      | CollectionHasNoRemote
      | CollectionIsSyncing
      | ConnectorNotAuthenticated
      | UnexpectedError
    >;

    /** Creates a new version for the collection and migrates all documents. */
    createNewVersion(
      id: CollectionId,
      latestVersionId: CollectionVersionId,
      schema: Schema,
      settings: CollectionVersionSettings,
      /** Null for collections with a remote. */
      migration: TypescriptModule | null,
      /** Null for collections without a remote. */
      remoteConverters: RemoteConverters | null,
    ): ResultPromise<
      Collection,
      | CollectionNotFound
      | CollectionVersionIdNotMatching
      | CollectionSchemaNotValid
      | ContentSummaryGetterNotValid
      | CollectionMigrationNotValid
      | RemoteConvertersNotValid
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
      | ContentSummaryGetterNotValid
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
      null,
      CollectionNotFound | CommandConfirmationNotValid | UnexpectedError
    >;

    list(): ResultPromise<Collection[], UnexpectedError>;

    listConnectors(): ResultPromise<Connector[], UnexpectedError>;

    getVersion(
      collectionId: CollectionId,
      collectionVersionId: CollectionVersionId,
    ): ResultPromise<
      CollectionVersion,
      CollectionVersionNotFound | UnexpectedError
    >;
  };

  documents: {
    create(
      collectionId: CollectionId,
      content: any,
    ): ResultPromise<
      Document,
      | CollectionNotFound
      | ConnectorDoesNotSupportUpSyncing
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
      | CollectionNotFound
      | DocumentNotFound
      | ConnectorDoesNotSupportUpSyncing
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
      null,
      | CollectionNotFound
      | DocumentNotFound
      | CommandConfirmationNotValid
      | ConnectorDoesNotSupportUpSyncing
      | UnexpectedError
    >;

    list(
      collectionId: CollectionId,
    ): ResultPromise<LiteDocument[], CollectionNotFound | UnexpectedError>;
    list(
      collectionId: CollectionId,
      lite: false,
    ): ResultPromise<Document[], CollectionNotFound | UnexpectedError>;
    list(
      collectionId: CollectionId,
      lite?: false,
    ): ResultPromise<
      (LiteDocument | Document)[],
      CollectionNotFound | UnexpectedError
    >;

    // TODO: return MinimalDocumentVersion
    listVersions(
      collectionId: CollectionId,
      id: DocumentId,
    ): ResultPromise<LiteDocumentVersion[], DocumentNotFound | UnexpectedError>;

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

    search(
      /** Null searches all collections. */
      collectionId: CollectionId | null,
      /** Full-text query. */
      query: string,
      options: {
        limit: number;
      },
    ): ResultPromise<
      TextSearchResult<LiteDocument>[],
      CollectionNotFound | UnexpectedError
    >;
  };

  files: {
    getContent(
      id: FileId,
    ): ResultPromise<Uint8Array<ArrayBuffer>, FileNotFound | UnexpectedError>;
  };

  assistants: {
    startConversation(
      assistant: AssistantName,
      format: ConversationFormat,
      userMessageContent: Message.User["content"],
    ): ResultPromise<Conversation, FilesNotFound | UnexpectedError>;

    continueConversation(
      id: ConversationId,
      userMessageContent: Message.User["content"],
    ): ResultPromise<
      Conversation,
      | ConversationNotFound
      | CannotContinueConversation
      | FilesNotFound
      | UnexpectedError
    >;

    retryLastResponse(
      id: ConversationId,
    ): ResultPromise<
      Conversation,
      ConversationNotFound | CannotRetryLastResponse | UnexpectedError
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
      null,
      ConversationNotFound | CommandConfirmationNotValid | UnexpectedError
    >;

    listConversations(): ResultPromise<LiteConversation[], UnexpectedError>;

    getConversation(
      id: ConversationId,
    ): ResultPromise<Conversation, ConversationNotFound | UnexpectedError>;

    searchConversations(
      query: string,
      options: { limit: number },
    ): ResultPromise<TextSearchResult<LiteConversation>[], UnexpectedError>;

    getDeveloperPrompts(): ResultPromise<DeveloperPrompts, UnexpectedError>;
  };

  inference: {
    stt(audio: AudioContent): ResultPromise<string, UnexpectedError>;

    tts(text: string): ResultPromise<AudioContent, UnexpectedError>;

    implementTypescriptModule(spec: {
      description: string;
      rules: string | null;
      additionalInstructions: string | null;
      template: string;
      libs: TypescriptFile[];
      startingPoint: TypescriptFile;
      userRequest: string;
    }): ResultPromise<
      TypescriptModule,
      | WriteTypescriptModuleToolNotCalled
      | TooManyFailedImplementationAttempts
      | UnexpectedError
    >;
  };

  apps: {
    create(
      type: AppType,
      name: string,
      targetCollectionIds: CollectionId[],
      files: AppVersion["files"],
    ): ResultPromise<
      App,
      AppNameNotValid | CollectionNotFound | UnexpectedError
    >;

    updateName(
      id: AppId,
      name: string,
    ): ResultPromise<App, AppNotFound | AppNameNotValid | UnexpectedError>;

    createNewVersion(
      id: AppId,
      targetCollectionIds: CollectionId[],
      files: AppVersion["files"],
    ): ResultPromise<App, AppNotFound | CollectionNotFound | UnexpectedError>;

    delete(
      id: AppId,
      commandConfirmation: string,
    ): ResultPromise<
      null,
      AppNotFound | CommandConfirmationNotValid | UnexpectedError
    >;

    list(): ResultPromise<App[], UnexpectedError>;
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
