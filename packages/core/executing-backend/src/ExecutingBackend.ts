import type { Backend } from "@superego/backend";
import makeResultError from "./makers/makeResultError.js";
import makeUnsuccessfulResult from "./makers/makeUnsuccessfulResult.js";
import type DataRepositories from "./requirements/DataRepositories.js";
import type DataRepositoriesManager from "./requirements/DataRepositoriesManager.js";
import type InferenceServiceFactory from "./requirements/InferenceServiceFactory.js";
import type JavascriptSandbox from "./requirements/JavascriptSandbox.js";
import AssistantContinueConversation from "./usecases/assistant/ContinueConversation.js";
import AssistantDeleteConversation from "./usecases/assistant/DeleteConversation.js";
import AssistantGetConversation from "./usecases/assistant/GetConversation.js";
import AssistantListConversations from "./usecases/assistant/ListConversations.js";
import AssistantRecoverConversation from "./usecases/assistant/RecoverConversation.js";
import AssistantStartConversation from "./usecases/assistant/StartConversation.js";
import BackgroundJobsList from "./usecases/background-jobs/List.js";
import CollectionCategoriesCreate from "./usecases/collection-categories/Create.js";
import CollectionCategoriesDelete from "./usecases/collection-categories/Delete.js";
import CollectionCategoriesList from "./usecases/collection-categories/List.js";
import CollectionCategoriesUpdate from "./usecases/collection-categories/Update.js";
import CollectionsCreate from "./usecases/collections/Create.js";
import CollectionsCreateNewVersion from "./usecases/collections/CreateNewVersion.js";
import CollectionsDelete from "./usecases/collections/Delete.js";
import CollectionsList from "./usecases/collections/List.js";
import CollectionUpdateLatestVersionSettings from "./usecases/collections/UpdateLatestVersionSettings.js";
import CollectionsUpdateSettings from "./usecases/collections/UpdateSettings.js";
import DocumentsCreate from "./usecases/documents/Create.js";
import DocumentsCreateNewVersion from "./usecases/documents/CreateNewVersion.js";
import DocumentsDelete from "./usecases/documents/Delete.js";
import DocumentsGet from "./usecases/documents/Get.js";
import DocumentsList from "./usecases/documents/List.js";
import FilesGetContent from "./usecases/files/GetContent.js";
import GlobalSettingsGet from "./usecases/global-settings/Get.js";
import GlobalSettingsUpdate from "./usecases/global-settings/Update.js";

export default class ExecutingBackend implements Backend {
  collectionCategories: Backend["collectionCategories"];
  collections: Backend["collections"];
  documents: Backend["documents"];
  files: Backend["files"];
  assistant: Backend["assistant"];
  backgroundJobs: Backend["backgroundJobs"];
  globalSettings: Backend["globalSettings"];

  constructor(
    private dataRepositoriesManager: DataRepositoriesManager,
    private javascriptSandbox: JavascriptSandbox,
    private inferenceServiceFactory: InferenceServiceFactory,
  ) {
    this.collectionCategories = {
      create: this.makeUsecase(CollectionCategoriesCreate, true),
      update: this.makeUsecase(CollectionCategoriesUpdate, true),
      delete: this.makeUsecase(CollectionCategoriesDelete, true),
      list: this.makeUsecase(CollectionCategoriesList, false),
    };

    this.collections = {
      create: this.makeUsecase(CollectionsCreate, true),
      updateSettings: this.makeUsecase(CollectionsUpdateSettings, true),
      createNewVersion: this.makeUsecase(CollectionsCreateNewVersion, true),
      updateLatestVersionSettings: this.makeUsecase(
        CollectionUpdateLatestVersionSettings,
        true,
      ),
      delete: this.makeUsecase(CollectionsDelete, true),
      list: this.makeUsecase(CollectionsList, false),
    };

    this.documents = {
      create: this.makeUsecase(DocumentsCreate, true),
      createNewVersion: this.makeUsecase(DocumentsCreateNewVersion, true),
      delete: this.makeUsecase(DocumentsDelete, true),
      list: this.makeUsecase(DocumentsList, false),
      get: this.makeUsecase(DocumentsGet, false),
    };

    this.files = {
      getContent: this.makeUsecase(FilesGetContent, false),
    };

    this.assistant = {
      startConversation: this.makeUsecase(AssistantStartConversation, true),
      continueConversation: this.makeUsecase(
        AssistantContinueConversation,
        true,
      ),
      recoverConversation: this.makeUsecase(AssistantRecoverConversation, true),
      deleteConversation: this.makeUsecase(AssistantDeleteConversation, true),
      listConversations: this.makeUsecase(AssistantListConversations, false),
      getConversation: this.makeUsecase(AssistantGetConversation, false),
    };

    this.backgroundJobs = {
      list: this.makeUsecase(BackgroundJobsList, false),
    };

    this.globalSettings = {
      get: this.makeUsecase(GlobalSettingsGet, false),
      update: this.makeUsecase(GlobalSettingsUpdate, true),
    };
  }

  private makeUsecase<Exec extends (...args: any[]) => any>(
    UsecaseClass: new (
      repos: DataRepositories,
      javascriptSandbox: JavascriptSandbox,
      inferenceServiceFactory: InferenceServiceFactory,
    ) => { exec: Exec },
    triggerBackgroundJobCheck: boolean,
  ): Exec {
    return (async (...args: any[]) =>
      this.dataRepositoriesManager
        .runInSerializableTransaction(async (dataRepositories) => {
          const usecase = new UsecaseClass(
            dataRepositories,
            this.javascriptSandbox,
            this.inferenceServiceFactory,
          );
          const result = await usecase.exec(...args);
          return {
            action: result.success ? "commit" : "rollback",
            returnValue: result,
          };
        })
        .then(() => {
          if (triggerBackgroundJobCheck) {
            // TODO: trigger background job check
          }
        })
        .catch((error) =>
          makeUnsuccessfulResult(
            makeResultError("UnexpectedError", { cause: error }),
          ),
        )) as Exec;
  }
}
