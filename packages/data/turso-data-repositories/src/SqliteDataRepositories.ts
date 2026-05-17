import type { GlobalSettings } from "@superego/backend";
import type {
  BackgroundJobRepository,
  DataRepositories,
} from "@superego/executing-backend";
import type AsyncSqliteDatabase from "./AsyncSqliteDatabase.js";
import SqliteAppRepository from "./repositories/SqliteAppRepository.js";
import SqliteAppVersionRepository from "./repositories/SqliteAppVersionRepository.js";
import SqliteBackgroundJobRepository from "./repositories/SqliteBackgroundJobRepository.js";
import SqliteCollectionCategoryRepository from "./repositories/SqliteCollectionCategoryRepository.js";
import SqliteCollectionRepository from "./repositories/SqliteCollectionRepository.js";
import SqliteCollectionVersionRepository from "./repositories/SqliteCollectionVersionRepository.js";
import SqliteConversationRepository from "./repositories/SqliteConversationRepository.js";
import SqliteConversationTextSearchIndex, {
  type SearchTextIndexState as ConversationSearchTextIndexState,
} from "./repositories/SqliteConversationTextSearchIndex.js";
import SqliteDocumentRepository from "./repositories/SqliteDocumentRepository.js";
import SqliteDocumentTextSearchIndex, {
  type SearchTextIndexState as DocumentSearchTextIndexState,
} from "./repositories/SqliteDocumentTextSearchIndex.js";
import SqliteDocumentVersionRepository from "./repositories/SqliteDocumentVersionRepository.js";
import SqliteFileRepository from "./repositories/SqliteFileRepository.js";
import SqliteGlobalSettingsRepository from "./repositories/SqliteGlobalSettingsRepository.js";

export default class SqliteDataRepositories implements DataRepositories {
  app: SqliteAppRepository;
  appVersion: SqliteAppVersionRepository;
  backgroundJob: BackgroundJobRepository;
  collectionCategory: SqliteCollectionCategoryRepository;
  collection: SqliteCollectionRepository;
  collectionVersion: SqliteCollectionVersionRepository;
  conversation: SqliteConversationRepository;
  conversationTextSearchIndex: SqliteConversationTextSearchIndex;
  document: SqliteDocumentRepository;
  documentVersion: SqliteDocumentVersionRepository;
  file: SqliteFileRepository;
  documentTextSearchIndex: SqliteDocumentTextSearchIndex;
  globalSettings: SqliteGlobalSettingsRepository;

  constructor(
    private db: AsyncSqliteDatabase,
    defaultGlobalSettings: GlobalSettings,
    searchTextIndexStates: {
      conversation: ConversationSearchTextIndexState;
      document: DocumentSearchTextIndexState;
    },
    onTransactionSucceeded: (callback: () => void) => void,
  ) {
    this.app = new SqliteAppRepository(db);
    this.appVersion = new SqliteAppVersionRepository(db);
    this.backgroundJob = new SqliteBackgroundJobRepository(db);
    this.collectionCategory = new SqliteCollectionCategoryRepository(db);
    this.collection = new SqliteCollectionRepository(db);
    this.collectionVersion = new SqliteCollectionVersionRepository(db);
    this.conversation = new SqliteConversationRepository(db);
    this.conversationTextSearchIndex = new SqliteConversationTextSearchIndex(
      db,
      searchTextIndexStates.conversation,
      onTransactionSucceeded,
    );
    this.document = new SqliteDocumentRepository(db);
    this.documentVersion = new SqliteDocumentVersionRepository(db);
    this.file = new SqliteFileRepository(db);
    this.documentTextSearchIndex = new SqliteDocumentTextSearchIndex(
      db,
      searchTextIndexStates.document,
      onTransactionSucceeded,
    );
    this.globalSettings = new SqliteGlobalSettingsRepository(
      db,
      defaultGlobalSettings,
    );
  }

  async export(path: string): Promise<void> {
    throw new Error(
      `Database export is not supported by the Turso WASM driver: ${path}`,
    );
  }

  async createSavepoint(): Promise<string> {
    const name = crypto.randomUUID();
    await this.db.prepare(`SAVEPOINT "${name}"`).run();
    return name;
  }

  async rollbackToSavepoint(name: string): Promise<void> {
    await this.db.prepare(`ROLLBACK TRANSACTION TO SAVEPOINT "${name}"`).run();
    await this.db.prepare(`RELEASE SAVEPOINT "${name}"`).run();
  }
}
