import type { Backend } from "@superego/backend";
import {
  extractErrorDetails,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import BackgroundJobExecutor from "./BackgroundJobExecutor.js";
import makeResultError from "./makers/makeResultError.js";
import type Connector from "./requirements/Connector.js";
import type DataRepositories from "./requirements/DataRepositories.js";
import type DataRepositoriesManager from "./requirements/DataRepositoriesManager.js";
import type InferenceServiceFactory from "./requirements/InferenceServiceFactory.js";
import type JavascriptSandbox from "./requirements/JavascriptSandbox.js";
import type TypescriptCompiler from "./requirements/TypescriptCompiler.js";
import AppsCreate from "./usecases/apps/Create.js";
import AppsCreateNewVersion from "./usecases/apps/CreateNewVersion.js";
import AppsDelete from "./usecases/apps/Delete.js";
import AppsList from "./usecases/apps/List.js";
import AppsUpdateName from "./usecases/apps/UpdateName.js";
import AssistantsContinueConversation from "./usecases/assistants/ContinueConversation.js";
import AssistantsDeleteConversation from "./usecases/assistants/DeleteConversation.js";
import AssistantsGetConversation from "./usecases/assistants/GetConversation.js";
import AssistantsGetDeveloperPrompts from "./usecases/assistants/GetDeveloperPrompts.js";
import AssistantsListConversations from "./usecases/assistants/ListConversations.js";
import AssistantsRecoverConversation from "./usecases/assistants/RecoverConversation.js";
import AssistantsRetryLastResponse from "./usecases/assistants/RetryLastResponse.js";
import AssistantsSearchConversations from "./usecases/assistants/SearchConversations.js";
import AssistantsStartConversation from "./usecases/assistants/StartConversation.js";
import BackgroundJobsGet from "./usecases/background-jobs/Get.js";
import BackgroundJobsList from "./usecases/background-jobs/List.js";
import BazaarGetPack from "./usecases/bazaar/GetPack.js";
import BazaarListPacks from "./usecases/bazaar/ListPacks.js";
import CollectionCategoriesCreate from "./usecases/collection-categories/Create.js";
import CollectionCategoriesDelete from "./usecases/collection-categories/Delete.js";
import CollectionCategoriesList from "./usecases/collection-categories/List.js";
import CollectionCategoriesUpdate from "./usecases/collection-categories/Update.js";
import CollectionsAuthenticateOAuth2PKCEConnector from "./usecases/collections/CollectionsAuthenticateOAuth2PKCEConnector.js";
import CollectionsCreate from "./usecases/collections/Create.js";
import CollectionsCreateMany from "./usecases/collections/CreateMany.js";
import CollectionsCreateNewVersion from "./usecases/collections/CreateNewVersion.js";
import CollectionsDelete from "./usecases/collections/Delete.js";
import CollectionsGetOAuth2PKCEConnectorAuthorizationRequestUrl from "./usecases/collections/GetOAuth2PKCEConnectorAuthorizationRequestUrl.js";
import CollectionsGetVersion from "./usecases/collections/GetVersion.js";
import CollectionsList from "./usecases/collections/List.js";
import CollectionsListConnectors from "./usecases/collections/ListConnectors.js";
import CollectionsSetRemote from "./usecases/collections/SetRemote.js";
import CollectionsTriggerDownSync from "./usecases/collections/TriggerDownSync.js";
import CollectionUpdateLatestVersionSettings from "./usecases/collections/UpdateLatestVersionSettings.js";
import CollectionsUpdateSettings from "./usecases/collections/UpdateSettings.js";
import DocumentsCreate from "./usecases/documents/Create.js";
import DocumentsCreateMany from "./usecases/documents/CreateMany.js";
import DocumentsCreateNewVersion from "./usecases/documents/CreateNewVersion.js";
import DocumentsDelete from "./usecases/documents/Delete.js";
import DocumentsGet from "./usecases/documents/Get.js";
import DocumentsGetVersion from "./usecases/documents/GetVersion.js";
import DocumentsList from "./usecases/documents/List.js";
import DocumentsListVersions from "./usecases/documents/ListVersions.js";
import DocumentsSearch from "./usecases/documents/Search.js";
import FilesGetContent from "./usecases/files/GetContent.js";
import GlobalSettingsGet from "./usecases/global-settings/Get.js";
import GlobalSettingsUpdate from "./usecases/global-settings/Update.js";
import InferenceImplementTypescriptModule from "./usecases/inference/ImplementTypescriptModule.js";
import InferenceStt from "./usecases/inference/Stt.js";
import InferenceTts from "./usecases/inference/Tts.js";
import PacksInstallPack from "./usecases/packs/InstallPack.js";

export default class ExecutingBackend implements Backend {
  collectionCategories: Backend["collectionCategories"];
  collections: Backend["collections"];
  documents: Backend["documents"];
  files: Backend["files"];
  assistants: Backend["assistants"];
  inference: Backend["inference"];
  apps: Backend["apps"];
  packs: Backend["packs"];
  bazaar: Backend["bazaar"];
  backgroundJobs: Backend["backgroundJobs"];
  globalSettings: Backend["globalSettings"];

  private backgroundJobExecutor: BackgroundJobExecutor;

  constructor(
    private dataRepositoriesManager: DataRepositoriesManager,
    private javascriptSandbox: JavascriptSandbox,
    private typescriptCompiler: TypescriptCompiler,
    private inferenceServiceFactory: InferenceServiceFactory,
    private connectors: Connector<any, any>[],
  ) {
    this.collectionCategories = {
      create: this.makeUsecase(CollectionCategoriesCreate, true),
      update: this.makeUsecase(CollectionCategoriesUpdate, true),
      delete: this.makeUsecase(CollectionCategoriesDelete, true),
      list: this.makeUsecase(CollectionCategoriesList, false),
    };

    this.collections = {
      create: this.makeUsecase(CollectionsCreate, true),
      createMany: this.makeUsecase(CollectionsCreateMany, true),
      updateSettings: this.makeUsecase(CollectionsUpdateSettings, true),
      setRemote: this.makeUsecase(CollectionsSetRemote, true),
      getOAuth2PKCEConnectorAuthorizationRequestUrl: this.makeUsecase(
        CollectionsGetOAuth2PKCEConnectorAuthorizationRequestUrl,
        false,
      ),
      authenticateOAuth2PKCEConnector: this.makeUsecase(
        CollectionsAuthenticateOAuth2PKCEConnector,
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
      getVersion: this.makeUsecase(CollectionsGetVersion, false),
    };

    this.documents = {
      create: this.makeUsecase(DocumentsCreate, true),
      createMany: this.makeUsecase(DocumentsCreateMany, true),
      createNewVersion: this.makeUsecase(DocumentsCreateNewVersion, true),
      delete: this.makeUsecase(DocumentsDelete, true),
      list: this.makeUsecase(DocumentsList, false),
      listVersions: this.makeUsecase(DocumentsListVersions, false),
      search: this.makeUsecase(DocumentsSearch, false),
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
      searchConversations: this.makeUsecase(
        AssistantsSearchConversations,
        false,
      ),
      getDeveloperPrompts: this.makeUsecase(
        AssistantsGetDeveloperPrompts,
        false,
      ),
    };

    this.inference = {
      stt: this.makeUsecase(InferenceStt, false),
      tts: this.makeUsecase(InferenceTts, false),
      implementTypescriptModule: this.makeUsecase(
        InferenceImplementTypescriptModule,
        false,
      ),
    };

    this.apps = {
      create: this.makeUsecase(AppsCreate, true),
      updateName: this.makeUsecase(AppsUpdateName, true),
      createNewVersion: this.makeUsecase(AppsCreateNewVersion, true),
      delete: this.makeUsecase(AppsDelete, true),
      list: this.makeUsecase(AppsList, false),
    };

    this.packs = {
      install: this.makeUsecase(PacksInstallPack, true),
    };

    this.bazaar = {
      listPacks: this.makeUsecase(BazaarListPacks, false),
      getPack: this.makeUsecase(BazaarGetPack, false),
    };

    this.backgroundJobs = {
      list: this.makeUsecase(BackgroundJobsList, false),
      get: this.makeUsecase(BackgroundJobsGet, false),
    };

    this.globalSettings = {
      get: this.makeUsecase(GlobalSettingsGet, false),
      update: this.makeUsecase(GlobalSettingsUpdate, true),
    };

    this.backgroundJobExecutor = new BackgroundJobExecutor(
      dataRepositoriesManager,
      javascriptSandbox,
      typescriptCompiler,
      inferenceServiceFactory,
      connectors,
    );
  }

  private makeUsecase<Exec extends (...args: any[]) => any>(
    UsecaseClass: new (
      repos: DataRepositories,
      javascriptSandbox: JavascriptSandbox,
      typescriptCompiler: TypescriptCompiler,
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
            this.typescriptCompiler,
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
