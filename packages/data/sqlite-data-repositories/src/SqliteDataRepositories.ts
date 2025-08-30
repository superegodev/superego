import type { DatabaseSync } from "node:sqlite";
import type { GlobalSettings } from "@superego/backend";
import type {
  BackgroundJobRepository,
  DataRepositories,
} from "@superego/executing-backend";
import SqliteBackgroundJobRepository from "./repositories/SqliteBackgroundJobRepository.js";
import SqliteCollectionCategoryRepository from "./repositories/SqliteCollectionCategoryRepository.js";
import SqliteCollectionRepository from "./repositories/SqliteCollectionRepository.js";
import SqliteCollectionVersionRepository from "./repositories/SqliteCollectionVersionRepository.js";
import SqliteConversationRepository from "./repositories/SqliteConversationRepository.js";
import SqliteDocumentRepository from "./repositories/SqliteDocumentRepository.js";
import SqliteDocumentVersionRepository from "./repositories/SqliteDocumentVersionRepository.js";
import SqliteFileRepository from "./repositories/SqliteFileRepository.js";
import SqliteGlobalSettingsRepository from "./repositories/SqliteGlobalSettingsRepository.js";

export default class SqliteDataRepositories implements DataRepositories {
  backgroundJob: BackgroundJobRepository;
  collectionCategory: SqliteCollectionCategoryRepository;
  collection: SqliteCollectionRepository;
  collectionVersion: SqliteCollectionVersionRepository;
  conversation: SqliteConversationRepository;
  document: SqliteDocumentRepository;
  documentVersion: SqliteDocumentVersionRepository;
  file: SqliteFileRepository;
  globalSettings: SqliteGlobalSettingsRepository;

  constructor(db: DatabaseSync, defaultGlobalSettings: GlobalSettings) {
    this.backgroundJob = new SqliteBackgroundJobRepository(db);
    this.collectionCategory = new SqliteCollectionCategoryRepository(db);
    this.collection = new SqliteCollectionRepository(db);
    this.collectionVersion = new SqliteCollectionVersionRepository(db);
    this.conversation = new SqliteConversationRepository(db);
    this.document = new SqliteDocumentRepository(db);
    this.documentVersion = new SqliteDocumentVersionRepository(db);
    this.file = new SqliteFileRepository(db);
    this.globalSettings = new SqliteGlobalSettingsRepository(
      db,
      defaultGlobalSettings,
    );
  }
}
