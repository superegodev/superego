import type { DataRepositories } from "@superego/executing-backend";
import type Data from "./Data.js";
import DemoAppRepository from "./repositories/DemoAppRepository.js";
import DemoAppVersionRepository from "./repositories/DemoAppVersionRepository.js";
import DemoBackgroundJobRepository from "./repositories/DemoBackgroundJobRepository.js";
import DemoCollectionCategoryRepository from "./repositories/DemoCollectionCategoryRepository.js";
import DemoCollectionRepository from "./repositories/DemoCollectionRepository.js";
import DemoCollectionVersionRepository from "./repositories/DemoCollectionVersionRepository.js";
import DemoConversationRepository from "./repositories/DemoConversationRepository.js";
import DemoDocumentRepository from "./repositories/DemoDocumentRepository.js";
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
  document: DemoDocumentRepository;
  documentVersion: DemoDocumentVersionRepository;
  file: DemoFileRepository;
  globalSettings: DemoGlobalSettingsRepository;

  constructor(
    data: Data,
    onWrite: () => void,
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
    this.document = new DemoDocumentRepository(data.documents, onWrite);
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

  dispose() {
    this.app.dispose();
    this.appVersion.dispose();
    this.backgroundJob.dispose();
    this.collectionCategory.dispose();
    this.collection.dispose();
    this.collectionVersion.dispose();
    this.conversation.dispose();
    this.document.dispose();
    this.documentVersion.dispose();
    this.file.dispose();
    this.globalSettings.dispose();
  }
}
