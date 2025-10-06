import type { Backend } from "@superego/backend";
import { extractErrorDetails } from "@superego/shared-utils";
import BackgroundJobExecutor from "./BackgroundJobExecutor.js";
import makeResultError from "./makers/makeResultError.js";
import makeUnsuccessfulResult from "./makers/makeUnsuccessfulResult.js";
import type Connector from "./requirements/Connector.js";
import type DataRepositories from "./requirements/DataRepositories.js";
import type DataRepositoriesManager from "./requirements/DataRepositoriesManager.js";
import type InferenceServiceFactory from "./requirements/InferenceServiceFactory.js";
import type JavascriptSandbox from "./requirements/JavascriptSandbox.js";
import AssistantsContinueConversation from "./usecases/assistants/ContinueConversation.js";
import AssistantsDeleteConversation from "./usecases/assistants/DeleteConversation.js";
import AssistantsGetConversation from "./usecases/assistants/GetConversation.js";
import AssistantsGetDeveloperPrompts from "./usecases/assistants/GetDeveloperPrompts.js";
import AssistantsListConversations from "./usecases/assistants/ListConversations.js";
import AssistantsRecoverConversation from "./usecases/assistants/RecoverConversation.js";
import AssistantsRetryLastResponse from "./usecases/assistants/RetryLastResponse.js";
import AssistantsStartConversation from "./usecases/assistants/StartConversation.js";
import AssistantsTts from "./usecases/assistants/Tts.js";
import BackgroundJobsList from "./usecases/background-jobs/List.js";
import CollectionCategoriesCreate from "./usecases/collection-categories/Create.js";
import CollectionCategoriesDelete from "./usecases/collection-categories/Delete.js";
import CollectionCategoriesList from "./usecases/collection-categories/List.js";
import CollectionCategoriesUpdate from "./usecases/collection-categories/Update.js";
import CollectionsAuthenticateRemoteConnector from "./usecases/collections/AuthenticateRemoteConnector.js";
import CollectionsCreate from "./usecases/collections/Create.js";
import CollectionsCreateNewVersion from "./usecases/collections/CreateNewVersion.js";
import CollectionsDelete from "./usecases/collections/Delete.js";
import CollectionsList from "./usecases/collections/List.js";
import CollectionsListConnectors from "./usecases/collections/ListConnectors.js";
import CollectionsSetRemote from "./usecases/collections/SetRemote.js";
import CollectionsTriggerDownSync from "./usecases/collections/TriggerDownSync.js";
import CollectionsUnsetRemote from "./usecases/collections/UnsetRemote.js";
import CollectionUpdateLatestVersionSettings from "./usecases/collections/UpdateLatestVersionSettings.js";
import CollectionsUpdateSettings from "./usecases/collections/UpdateSettings.js";
import DocumentsCreate from "./usecases/documents/Create.js";
import DocumentsCreateNewVersion from "./usecases/documents/CreateNewVersion.js";
import DocumentsDelete from "./usecases/documents/Delete.js";
import DocumentsGet from "./usecases/documents/Get.js";
import DocumentsGetVersion from "./usecases/documents/GetVersion.js";
import DocumentsList from "./usecases/documents/List.js";
import FilesGetContent from "./usecases/files/GetContent.js";
import GlobalSettingsGet from "./usecases/global-settings/Get.js";
import GlobalSettingsUpdate from "./usecases/global-settings/Update.js";

export default class ExecutingBackend implements Backend {
  collectionCategories: Backend["collectionCategories"];
  collections: Backend["collections"];
  documents: Backend["documents"];
  files: Backend["files"];
  assistants: Backend["assistants"];
  backgroundJobs: Backend["backgroundJobs"];
  globalSettings: Backend["globalSettings"];

  private backgroundJobExecutor: BackgroundJobExecutor;

  constructor(
    private dataRepositoriesManager: DataRepositoriesManager,
    private javascriptSandbox: JavascriptSandbox,
    private inferenceServiceFactory: InferenceServiceFactory,
    private connectors: Connector[],
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
      setRemote: this.makeUsecase(CollectionsSetRemote, true),
      unsetRemote: this.makeUsecase(CollectionsUnsetRemote, true),
      authenticateRemoteConnector: this.makeUsecase(
        CollectionsAuthenticateRemoteConnector,
        true,
      ),
      createNewVersion: this.makeUsecase(CollectionsCreateNewVersion, true),
      updateLatestVersionSettings: this.makeUsecase(
        CollectionUpdateLatestVersionSettings,
        true,
      ),
      delete: this.makeUsecase(CollectionsDelete, true),
      list: this.makeUsecase(CollectionsList, false),
      triggerDownSync: this.makeUsecase(CollectionsTriggerDownSync, true),
      listConnectors: this.makeUsecase(CollectionsListConnectors, false),
    };

    this.documents = {
      create: this.makeUsecase(DocumentsCreate, true),
      createNewVersion: this.makeUsecase(DocumentsCreateNewVersion, true),
      delete: this.makeUsecase(DocumentsDelete, true),
      list: this.makeUsecase(DocumentsList, false),
      get: this.makeUsecase(DocumentsGet, false),
      getVersion: this.makeUsecase(DocumentsGetVersion, false),
    };

    this.files = {
      getContent: this.makeUsecase(FilesGetContent, false),
    };

    this.assistants = {
      startConversation: this.makeUsecase(AssistantsStartConversation, true),
      continueConversation: this.makeUsecase(
        AssistantsContinueConversation,
        true,
      ),
      retryLastResponse: this.makeUsecase(AssistantsRetryLastResponse, true),
      recoverConversation: this.makeUsecase(
        AssistantsRecoverConversation,
        true,
      ),
      deleteConversation: this.makeUsecase(AssistantsDeleteConversation, true),
      listConversations: this.makeUsecase(AssistantsListConversations, false),
      getConversation: this.makeUsecase(AssistantsGetConversation, false),
      getDeveloperPrompts: this.makeUsecase(
        AssistantsGetDeveloperPrompts,
        false,
      ),
      tts: this.makeUsecase(AssistantsTts, false),
    };

    this.backgroundJobs = {
      list: this.makeUsecase(BackgroundJobsList, false),
    };

    this.globalSettings = {
      get: this.makeUsecase(GlobalSettingsGet, false),
      update: this.makeUsecase(GlobalSettingsUpdate, true),
    };

    this.backgroundJobExecutor = new BackgroundJobExecutor(
      dataRepositoriesManager,
      javascriptSandbox,
      inferenceServiceFactory,
      connectors,
    );
  }

  private makeUsecase<Exec extends (...args: any[]) => any>(
    UsecaseClass: new (
      repos: DataRepositories,
      javascriptSandbox: JavascriptSandbox,
      inferenceServiceFactory: InferenceServiceFactory,
      connectors: Connector[],
    ) => { exec: Exec },
    triggerBackgroundJobCheck: boolean,
  ): Exec {
    return (async (...args: any[]) =>
      this.dataRepositoriesManager
        .runInSerializableTransaction(async (repos) => {
          const usecase = new UsecaseClass(
            repos,
            this.javascriptSandbox,
            this.inferenceServiceFactory,
            this.connectors,
          );
          const result = await usecase.exec(...args);
          return {
            action: result.success ? "commit" : "rollback",
            returnValue: result,
          };
        })
        .then((result) => {
          // We trigger a background job check only _after_ the transaction that
          // might have created some background jobs has been committed. (Else
          // the BackgroundJobExecutor wouldn't even see the created background
          // jobs, since it executes in a separate transaction.)
          if (triggerBackgroundJobCheck) {
            // Note: this call is purposefully not awaited.
            this.backgroundJobExecutor.executeNext();
          }
          return result;
        })
        .catch((error) =>
          makeUnsuccessfulResult(
            makeResultError("UnexpectedError", {
              cause: extractErrorDetails(error),
            }),
          ),
        )) as Exec;
  }
}
