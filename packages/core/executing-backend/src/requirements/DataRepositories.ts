import type AppRepository from "./AppRepository.js";
import type AppVersionRepository from "./AppVersionRepository.js";
import type BackgroundJobRepository from "./BackgroundJobRepository.js";
import type CollectionCategoryRepository from "./CollectionCategoryRepository.js";
import type CollectionRepository from "./CollectionRepository.js";
import type CollectionVersionRepository from "./CollectionVersionRepository.js";
import type ConversationRepository from "./ConversationRepository.js";
import type DocumentRepository from "./DocumentRepository.js";
import type DocumentVersionRepository from "./DocumentVersionRepository.js";
import type FileRepository from "./FileRepository.js";
import type GlobalSettingsRepository from "./GlobalSettingsRepository.js";

export default interface DataRepositories {
  app: AppRepository;
  appVersion: AppVersionRepository;
  collectionCategory: CollectionCategoryRepository;
  collection: CollectionRepository;
  collectionVersion: CollectionVersionRepository;
  document: DocumentRepository;
  documentVersion: DocumentVersionRepository;
  file: FileRepository;
  conversation: ConversationRepository;
  backgroundJob: BackgroundJobRepository;
  globalSettings: GlobalSettingsRepository;
  createSavepoint(): Promise<string>;
  rollbackToSavepoint(savepoint: string): Promise<void>;
}
