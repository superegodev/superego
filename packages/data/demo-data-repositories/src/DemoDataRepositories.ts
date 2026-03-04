import type { DataRepositories } from "@superego/executing-backend";
import type Data from "./Data.js";
import DemoAppRepository from "./repositories/DemoAppRepository.js";
import DemoAppVersionRepository from "./repositories/DemoAppVersionRepository.js";
import DemoBackgroundJobRepository from "./repositories/DemoBackgroundJobRepository.js";
import DemoCollectionCategoryRepository from "./repositories/DemoCollectionCategoryRepository.js";
import DemoCollectionRepository from "./repositories/DemoCollectionRepository.js";
import DemoCollectionVersionRepository from "./repositories/DemoCollectionVersionRepository.js";
import DemoConversationRepository from "./repositories/DemoConversationRepository.js";
import DemoConversationTextSearchIndex, {
  type SearchTextIndexState as ConversationSearchTextIndexState,
} from "./repositories/DemoConversationTextSearchIndex.js";
import DemoDocumentRepository from "./repositories/DemoDocumentRepository.js";
import DemoDocumentTextSearchIndex, {
  type SearchTextIndexState as DocumentSearchTextIndexState,
} from "./repositories/DemoDocumentTextSearchIndex.js";
import DemoDocumentVersionRepository from "./repositories/DemoDocumentVersionRepository.js";
import DemoFileRepository from "./repositories/DemoFileRepository.js";
import DemoGlobalSettingsRepository from "./repositories/DemoGlobalSettingsRepository.js";

export default class DemoDataRepositories implements DataRepositories {
  app: DemoAppRepository;
  appVersion: DemoAppVersionRepository;
  backgroundJob: DemoBackgroundJobRepository;
  collectionCategory: DemoCollectionCategoryRepository;
  collection: DemoCollectionRepository;
  collectionVersion: DemoCollectionVersionRepository;
  conversation: DemoConversationRepository;
  conversationTextSearchIndex: DemoConversationTextSearchIndex;
  document: DemoDocumentRepository;
  documentTextSearchIndex: DemoDocumentTextSearchIndex;
  documentVersion: DemoDocumentVersionRepository;
  file: DemoFileRepository;
  globalSettings: DemoGlobalSettingsRepository;

  constructor(
    private data: Data,
    onWrite: () => void,
    onTransactionSucceeded: (callback: () => void) => void,
    searchTextIndexStates: {
      conversation: ConversationSearchTextIndexState;
      document: DocumentSearchTextIndexState;
    },
    public createSavepoint: () => Promise<string>,
    public rollbackToSavepoint: (name: string) => Promise<void>,
  ) {
    this.app = new DemoAppRepository(data.apps, onWrite);
    this.appVersion = new DemoAppVersionRepository(data.appVersions, onWrite);
    this.backgroundJob = new DemoBackgroundJobRepository(
      data.backgroundJobs,
      onWrite,
    );
    this.collectionCategory = new DemoCollectionCategoryRepository(
      data.collectionCategories,
      onWrite,
    );
    this.collection = new DemoCollectionRepository(data.collections, onWrite);
    this.collectionVersion = new DemoCollectionVersionRepository(
      data.collectionVersions,
      onWrite,
    );
    this.conversationTextSearchIndex = new DemoConversationTextSearchIndex(
      data.conversationTextSearchTexts,
      searchTextIndexStates.conversation,
      onTransactionSucceeded,
      onWrite,
    );
    this.document = new DemoDocumentRepository(data.documents, onWrite);
    this.documentTextSearchIndex = new DemoDocumentTextSearchIndex(
      data.documentTextSearchTexts,
      searchTextIndexStates.document,
      onTransactionSucceeded,
      onWrite,
    );
    this.documentVersion = new DemoDocumentVersionRepository(
      data.documentVersions,
      onWrite,
    );
    this.file = new DemoFileRepository(data.files, onWrite);
    this.conversation = new DemoConversationRepository(
      data.conversations,
      onWrite,
    );
    this.globalSettings = new DemoGlobalSettingsRepository(
      data.globalSettings,
      onWrite,
    );
  }

  async export(path: string): Promise<void> {
    const json = JSON.stringify(this.data, null, 2);
    if (typeof document !== "undefined") {
      const fileName = path.split("/").pop() || path.split("\\").pop() || path;
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const { writeFileSync } = await import("node:fs");
      writeFileSync(path, json);
    }
  }

  dispose() {
    this.app.dispose();
    this.appVersion.dispose();
    this.backgroundJob.dispose();
    this.collectionCategory.dispose();
    this.collection.dispose();
    this.collectionVersion.dispose();
    this.conversation.dispose();
    this.conversationTextSearchIndex.dispose();
    this.document.dispose();
    this.documentTextSearchIndex.dispose();
    this.documentVersion.dispose();
    this.file.dispose();
    this.globalSettings.dispose();
  }
}
