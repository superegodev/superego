import type { DataRepositories } from "@superego/executing-backend";
import type Data from "./Data.js";
import DemoCollectionCategoryRepository from "./repositories/DemoCollectionCategoryRepository.js";
import DemoCollectionRepository from "./repositories/DemoCollectionRepository.js";
import DemoCollectionVersionRepository from "./repositories/DemoCollectionVersionRepository.js";
import DemoDocumentRepository from "./repositories/DemoDocumentRepository.js";
import DemoDocumentVersionRepository from "./repositories/DemoDocumentVersionRepository.js";
import DemoFileRepository from "./repositories/DemoFileRepository.js";
import DemoGlobalSettingsRepository from "./repositories/DemoGlobalSettingsRepository.js";

export default class DemoDataRepositories implements DataRepositories {
  collectionCategory: DemoCollectionCategoryRepository;
  collection: DemoCollectionRepository;
  collectionVersion: DemoCollectionVersionRepository;
  document: DemoDocumentRepository;
  documentVersion: DemoDocumentVersionRepository;
  file: DemoFileRepository;
  globalSettings: DemoGlobalSettingsRepository;

  constructor(data: Data, onWrite: () => void) {
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
    this.globalSettings = new DemoGlobalSettingsRepository(
      data.globalSettings,
      onWrite,
    );
  }

  dispose() {
    this.collectionCategory.dispose();
    this.collection.dispose();
    this.collectionVersion.dispose();
    this.document.dispose();
    this.documentVersion.dispose();
    this.file.dispose();
    this.globalSettings.dispose();
  }
}
