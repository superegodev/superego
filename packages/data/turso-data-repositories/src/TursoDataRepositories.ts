import type { GlobalSettings } from "@superego/backend";
import type {
  BackgroundJobRepository,
  DataRepositories,
} from "@superego/executing-backend";
import TursoAppRepository from "./repositories/TursoAppRepository.js";
import TursoAppVersionRepository from "./repositories/TursoAppVersionRepository.js";
import TursoBackgroundJobRepository from "./repositories/TursoBackgroundJobRepository.js";
import TursoCollectionCategoryRepository from "./repositories/TursoCollectionCategoryRepository.js";
import TursoCollectionRepository from "./repositories/TursoCollectionRepository.js";
import TursoCollectionVersionRepository from "./repositories/TursoCollectionVersionRepository.js";
import TursoConversationRepository from "./repositories/TursoConversationRepository.js";
import TursoConversationTextSearchIndex, {
  type SearchTextIndexState as ConversationSearchTextIndexState,
} from "./repositories/TursoConversationTextSearchIndex.js";
import TursoDocumentRepository from "./repositories/TursoDocumentRepository.js";
import TursoDocumentTextSearchIndex, {
  type SearchTextIndexState as DocumentSearchTextIndexState,
} from "./repositories/TursoDocumentTextSearchIndex.js";
import TursoDocumentVersionRepository from "./repositories/TursoDocumentVersionRepository.js";
import TursoFileRepository from "./repositories/TursoFileRepository.js";
import TursoGlobalSettingsRepository from "./repositories/TursoGlobalSettingsRepository.js";
import TursoDatabase from "./TursoDatabase.js";

export default class TursoDataRepositories implements DataRepositories {
  app: TursoAppRepository;
  appVersion: TursoAppVersionRepository;
  backgroundJob: BackgroundJobRepository;
  collectionCategory: TursoCollectionCategoryRepository;
  collection: TursoCollectionRepository;
  collectionVersion: TursoCollectionVersionRepository;
  conversation: TursoConversationRepository;
  conversationTextSearchIndex: TursoConversationTextSearchIndex;
  document: TursoDocumentRepository;
  documentVersion: TursoDocumentVersionRepository;
  file: TursoFileRepository;
  documentTextSearchIndex: TursoDocumentTextSearchIndex;
  globalSettings: TursoGlobalSettingsRepository;

  constructor(
    private db: TursoDatabase,
    defaultGlobalSettings: GlobalSettings,
    searchTextIndexStates: {
      conversation: ConversationSearchTextIndexState;
      document: DocumentSearchTextIndexState;
    },
    onTransactionSucceeded: (callback: () => void) => void,
  ) {
    this.app = new TursoAppRepository(db);
    this.appVersion = new TursoAppVersionRepository(db);
    this.backgroundJob = new TursoBackgroundJobRepository(db);
    this.collectionCategory = new TursoCollectionCategoryRepository(db);
    this.collection = new TursoCollectionRepository(db);
    this.collectionVersion = new TursoCollectionVersionRepository(db);
    this.conversation = new TursoConversationRepository(db);
    this.conversationTextSearchIndex = new TursoConversationTextSearchIndex(
      db,
      searchTextIndexStates.conversation,
      onTransactionSucceeded,
    );
    this.document = new TursoDocumentRepository(db);
    this.documentVersion = new TursoDocumentVersionRepository(db);
    this.file = new TursoFileRepository(db);
    this.documentTextSearchIndex = new TursoDocumentTextSearchIndex(
      db,
      searchTextIndexStates.document,
      onTransactionSucceeded,
    );
    this.globalSettings = new TursoGlobalSettingsRepository(
      db,
      defaultGlobalSettings,
    );
  }

  async export(fileName: string): Promise<void> {
    await this.db.export(fileName);
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
