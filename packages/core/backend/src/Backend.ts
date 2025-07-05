import type { Schema } from "@superego/schema";
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
import type DocumentContentNotValid from "./errors/DocumentContentNotValid.js";
import type DocumentNotFound from "./errors/DocumentNotFound.js";
import type DocumentVersionIdNotMatching from "./errors/DocumentVersionIdNotMatching.js";
import type FileNotFound from "./errors/FileNotFound.js";
import type FilesNotFound from "./errors/FilesNotFound.js";
import type CollectionCategoryIsDescendant from "./errors/ParentCollectionCategoryIsDescendant.js";
import type ParentCollectionCategoryNotFound from "./errors/ParentCollectionCategoryNotFound.js";
import type CollectionCategoryId from "./ids/CollectionCategoryId.js";
import type CollectionId from "./ids/CollectionId.js";
import type CollectionVersionId from "./ids/CollectionVersionId.js";
import type DocumentId from "./ids/DocumentId.js";
import type DocumentVersionId from "./ids/DocumentVersionId.js";
import type FileId from "./ids/FileId.js";
import type Collection from "./types/Collection.js";
import type CollectionCategory from "./types/CollectionCategory.js";
import type CollectionSettings from "./types/CollectionSettings.js";
import type CollectionVersionSettings from "./types/CollectionVersionSettings.js";
import type DeletedEntities from "./types/DeletedEntities.js";
import type Document from "./types/Document.js";
import type GlobalSettings from "./types/GlobalSettings.js";
import type RpcResultPromise from "./types/RpcResultPromise.js";
import type TypescriptModule from "./types/TypescriptModule.js";

export default interface Backend {
  collectionCategories: {
    create(
      proto: Pick<CollectionCategory, "name" | "icon" | "parentId">,
    ): RpcResultPromise<
      CollectionCategory,
      | CollectionCategoryNameNotValid
      | CollectionCategoryIconNotValid
      | ParentCollectionCategoryNotFound
    >;

    update(
      id: CollectionCategoryId,
      patch: Partial<Pick<CollectionCategory, "name" | "icon" | "parentId">>,
    ): RpcResultPromise<
      CollectionCategory,
      | CollectionCategoryNotFound
      | CollectionCategoryNameNotValid
      | CollectionCategoryIconNotValid
      | ParentCollectionCategoryNotFound
      | CollectionCategoryIsDescendant
    >;

    delete(
      id: CollectionCategoryId,
    ): RpcResultPromise<
      DeletedEntities,
      CollectionCategoryNotFound | CollectionCategoryHasChildren
    >;

    list(): RpcResultPromise<CollectionCategory[]>;
  };

  collections: {
    create(
      settings: CollectionSettings,
      schema: Schema,
      versionSettings: CollectionVersionSettings,
    ): RpcResultPromise<
      Collection,
      | CollectionSettingsNotValid
      | CollectionCategoryNotFound
      | CollectionSchemaNotValid
      | CollectionSummaryPropertiesNotValid
    >;

    updateSettings(
      id: CollectionId,
      settingsPatch: Partial<CollectionSettings>,
    ): RpcResultPromise<
      Collection,
      | CollectionNotFound
      | CollectionSettingsNotValid
      | CollectionCategoryNotFound
    >;

    /** Creates a new version for the collection and migrates all documents. */
    createNewVersion(
      id: CollectionId,
      latestVersionId: CollectionVersionId,
      schema: Schema,
      settings: CollectionVersionSettings,
      migration: TypescriptModule,
    ): RpcResultPromise<
      Collection,
      | CollectionNotFound
      | CollectionVersionIdNotMatching
      | CollectionSchemaNotValid
      | CollectionSummaryPropertiesNotValid
      | CollectionMigrationNotValid
      | CollectionMigrationFailed
    >;

    updateLatestVersionSettings(
      id: CollectionId,
      latestVersionId: CollectionVersionId,
      settingsPatch: Partial<CollectionVersionSettings>,
    ): RpcResultPromise<
      Collection,
      | CollectionNotFound
      | CollectionVersionIdNotMatching
      | CollectionSummaryPropertiesNotValid
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
    ): RpcResultPromise<
      DeletedEntities,
      CollectionNotFound | CommandConfirmationNotValid
    >;

    list(): RpcResultPromise<Collection[]>;
  };

  documents: {
    create(
      collectionId: CollectionId,
      content: any,
    ): RpcResultPromise<
      Document,
      CollectionNotFound | DocumentContentNotValid | FilesNotFound
    >;

    createNewVersion(
      collectionId: CollectionId,
      id: DocumentId,
      latestVersionId: DocumentVersionId,
      content: any,
    ): RpcResultPromise<
      Document,
      | DocumentNotFound
      | DocumentVersionIdNotMatching
      | DocumentContentNotValid
      | FilesNotFound
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
    ): RpcResultPromise<
      DeletedEntities,
      DocumentNotFound | CommandConfirmationNotValid
    >;

    list(
      collectionId: CollectionId,
    ): RpcResultPromise<Document[], CollectionNotFound>;

    get(
      collectionId: CollectionId,
      id: DocumentId,
    ): RpcResultPromise<Document, DocumentNotFound>;
  };

  files: {
    getContent(
      collectionId: CollectionId,
      documentId: DocumentId,
      id: FileId,
    ): RpcResultPromise<Uint8Array, FileNotFound>;
  };

  globalSettings: {
    get(): RpcResultPromise<GlobalSettings>;

    update(
      globalSettingsPatch: Partial<GlobalSettings>,
    ): RpcResultPromise<GlobalSettings>;
  };
}
