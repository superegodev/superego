import {
  type Backend,
  backendContracts,
  type Contract,
  makeResultSchema,
} from "@superego/backend";
import {
  extractErrorDetails,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import * as v from "valibot";
import BackgroundJobExecutor from "./BackgroundJobExecutor.js";
import type Config from "./Config.js";
import LiveConversationStore from "./LiveConversationStore.js";
import makeResultError from "./makers/makeResultError.js";
import makeValidationIssues from "./makers/makeValidationIssues.js";
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
import AssistantsGetLiveConversation from "./usecases/assistants/GetLiveConversation.js";
import AssistantsListConversations from "./usecases/assistants/ListConversations.js";
import AssistantsRecoverConversation from "./usecases/assistants/RecoverConversation.js";
import AssistantsRetryLastResponse from "./usecases/assistants/RetryLastResponse.js";
import AssistantsSearchConversations from "./usecases/assistants/SearchConversations.js";
import AssistantsStartConversation from "./usecases/assistants/StartConversation.js";
import BackgroundJobsGet from "./usecases/background-jobs/Get.js";
import BackgroundJobsList from "./usecases/background-jobs/List.js";
import BoutiqueGetPack from "./usecases/boutique/GetPack.js";
import BoutiqueListPacks from "./usecases/boutique/ListPacks.js";
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
import DatabaseExport from "./usecases/database/Export.js";
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
import PacksInstall from "./usecases/packs/Install.js";

export default class ExecutingBackend implements Backend {
  collectionCategories: Backend["collectionCategories"];
  collections: Backend["collections"];
  documents: Backend["documents"];
  files: Backend["files"];
  assistants: Backend["assistants"];
  inference: Backend["inference"];
  apps: Backend["apps"];
  packs: Backend["packs"];
  boutique: Backend["boutique"];
  backgroundJobs: Backend["backgroundJobs"];
  globalSettings: Backend["globalSettings"];
  database: Backend["database"];

  private liveConversationStore: LiveConversationStore;
  private backgroundJobExecutor: BackgroundJobExecutor;

  private resolvedConfig: Config;

  constructor(
    private dataRepositoriesManager: DataRepositoriesManager,
    private javascriptSandbox: JavascriptSandbox,
    private typescriptCompiler: TypescriptCompiler,
    private inferenceServiceFactory: InferenceServiceFactory,
    private connectors: Connector<any, any>[],
    config?: Partial<Config>,
  ) {
    this.resolvedConfig = {
      conversationProcessingStuckTimeout: 5 * 60 * 1_000,
      backgroundJobProcessingStuckTimeout: 5 * 60 * 1_000,
      ...config,
    };
    this.collectionCategories = {
      create: this.makeUsecase(
        backendContracts.collectionCategories.create,
        CollectionCategoriesCreate,
        true,
      ),
      update: this.makeUsecase(
        backendContracts.collectionCategories.update,
        CollectionCategoriesUpdate,
        true,
      ),
      delete: this.makeUsecase(
        backendContracts.collectionCategories.delete,
        CollectionCategoriesDelete,
        true,
      ),
      list: this.makeUsecase(
        backendContracts.collectionCategories.list,
        CollectionCategoriesList,
        false,
      ),
    };

    this.collections = {
      create: this.makeUsecase(
        backendContracts.collections.create,
        CollectionsCreate,
        true,
      ),
      createMany: this.makeUsecase(
        backendContracts.collections.createMany,
        CollectionsCreateMany,
        true,
      ),
      updateSettings: this.makeUsecase(
        backendContracts.collections.updateSettings,
        CollectionsUpdateSettings,
        true,
      ),
      setRemote: this.makeUsecase(
        backendContracts.collections.setRemote,
        CollectionsSetRemote,
        true,
      ),
      getOAuth2PKCEConnectorAuthorizationRequestUrl: this.makeUsecase(
        backendContracts.collections
          .getOAuth2PKCEConnectorAuthorizationRequestUrl,
        CollectionsGetOAuth2PKCEConnectorAuthorizationRequestUrl,
        false,
      ),
      authenticateOAuth2PKCEConnector: this.makeUsecase(
        backendContracts.collections.authenticateOAuth2PKCEConnector,
        CollectionsAuthenticateOAuth2PKCEConnector,
        true,
      ),
      createNewVersion: this.makeUsecase(
        backendContracts.collections.createNewVersion,
        CollectionsCreateNewVersion,
        true,
      ),
      updateLatestVersionSettings: this.makeUsecase(
        backendContracts.collections.updateLatestVersionSettings,
        CollectionUpdateLatestVersionSettings,
        true,
      ),
      delete: this.makeUsecase(
        backendContracts.collections.delete,
        CollectionsDelete,
        true,
      ),
      list: this.makeUsecase(
        backendContracts.collections.list,
        CollectionsList,
        false,
      ),
      triggerDownSync: this.makeUsecase(
        backendContracts.collections.triggerDownSync,
        CollectionsTriggerDownSync,
        true,
      ),
      listConnectors: this.makeUsecase(
        backendContracts.collections.listConnectors,
        CollectionsListConnectors,
        false,
      ),
      getVersion: this.makeUsecase(
        backendContracts.collections.getVersion,
        CollectionsGetVersion,
        false,
      ),
    };

    this.documents = {
      create: this.makeUsecase(
        backendContracts.documents.create,
        DocumentsCreate,
        true,
      ),
      createMany: this.makeUsecase(
        backendContracts.documents.createMany,
        DocumentsCreateMany,
        true,
      ),
      createNewVersion: this.makeUsecase(
        backendContracts.documents.createNewVersion,
        DocumentsCreateNewVersion,
        true,
      ),
      delete: this.makeUsecase(
        backendContracts.documents.delete,
        DocumentsDelete,
        true,
      ),
      list: this.makeUsecase(
        backendContracts.documents.list,
        DocumentsList,
        false,
      ),
      listVersions: this.makeUsecase(
        backendContracts.documents.listVersions,
        DocumentsListVersions,
        false,
      ),
      search: this.makeUsecase(
        backendContracts.documents.search,
        DocumentsSearch,
        false,
      ),
      get: this.makeUsecase(
        backendContracts.documents.get,
        DocumentsGet,
        false,
      ),
      getVersion: this.makeUsecase(
        backendContracts.documents.getVersion,
        DocumentsGetVersion,
        false,
      ),
    };

    this.files = {
      getContent: this.makeUsecase(
        backendContracts.files.getContent,
        FilesGetContent,
        false,
      ),
    };

    this.assistants = {
      startConversation: this.makeUsecase(
        backendContracts.assistants.startConversation,
        AssistantsStartConversation,
        true,
      ),
      continueConversation: this.makeUsecase(
        backendContracts.assistants.continueConversation,
        AssistantsContinueConversation,
        true,
      ),
      retryLastResponse: this.makeUsecase(
        backendContracts.assistants.retryLastResponse,
        AssistantsRetryLastResponse,
        true,
      ),
      recoverConversation: this.makeUsecase(
        backendContracts.assistants.recoverConversation,
        AssistantsRecoverConversation,
        true,
      ),
      deleteConversation: this.makeUsecase(
        backendContracts.assistants.deleteConversation,
        AssistantsDeleteConversation,
        true,
      ),
      listConversations: this.makeUsecase(
        backendContracts.assistants.listConversations,
        AssistantsListConversations,
        false,
      ),
      getConversation: this.makeUsecase(
        backendContracts.assistants.getConversation,
        AssistantsGetConversation,
        false,
      ),
      searchConversations: this.makeUsecase(
        backendContracts.assistants.searchConversations,
        AssistantsSearchConversations,
        false,
      ),
      getLiveConversation: this.makeUsecase(
        backendContracts.assistants.getLiveConversation,
        AssistantsGetLiveConversation,
        false,
      ),
      getDeveloperPrompts: this.makeUsecase(
        backendContracts.assistants.getDeveloperPrompts,
        AssistantsGetDeveloperPrompts,
        false,
      ),
    };

    this.inference = {
      stt: this.makeUsecase(
        backendContracts.inference.stt,
        InferenceStt,
        false,
      ),
      implementTypescriptModule: this.makeUsecase(
        backendContracts.inference.implementTypescriptModule,
        InferenceImplementTypescriptModule,
        false,
      ),
    };

    this.apps = {
      create: this.makeUsecase(backendContracts.apps.create, AppsCreate, true),
      updateName: this.makeUsecase(
        backendContracts.apps.updateName,
        AppsUpdateName,
        true,
      ),
      createNewVersion: this.makeUsecase(
        backendContracts.apps.createNewVersion,
        AppsCreateNewVersion,
        true,
      ),
      delete: this.makeUsecase(backendContracts.apps.delete, AppsDelete, true),
      list: this.makeUsecase(backendContracts.apps.list, AppsList, false),
    };

    this.packs = {
      install: this.makeUsecase(
        backendContracts.packs.install,
        PacksInstall,
        true,
      ),
    };

    this.boutique = {
      listPacks: this.makeUsecase(
        backendContracts.boutique.listPacks,
        BoutiqueListPacks,
        false,
      ),
      getPack: this.makeUsecase(
        backendContracts.boutique.getPack,
        BoutiqueGetPack,
        false,
      ),
    };

    this.backgroundJobs = {
      list: this.makeUsecase(
        backendContracts.backgroundJobs.list,
        BackgroundJobsList,
        false,
      ),
      get: this.makeUsecase(
        backendContracts.backgroundJobs.get,
        BackgroundJobsGet,
        false,
      ),
    };

    this.globalSettings = {
      get: this.makeUsecase(
        backendContracts.globalSettings.get,
        GlobalSettingsGet,
        false,
      ),
      update: this.makeUsecase(
        backendContracts.globalSettings.update,
        GlobalSettingsUpdate,
        true,
      ),
    };

    this.database = {
      export: this.makeUsecase(
        backendContracts.database.export,
        DatabaseExport,
        false,
      ),
    };

    this.liveConversationStore = new LiveConversationStore();
    this.backgroundJobExecutor = new BackgroundJobExecutor(
      dataRepositoriesManager,
      javascriptSandbox,
      typescriptCompiler,
      inferenceServiceFactory,
      connectors,
      this.liveConversationStore,
      this.resolvedConfig,
    );
  }

  private makeUsecase<C extends Contract>(
    contract: C,
    UsecaseClass: new (
      repos: DataRepositories,
      javascriptSandbox: JavascriptSandbox,
      typescriptCompiler: TypescriptCompiler,
      inferenceServiceFactory: InferenceServiceFactory,
      connectors: Connector[],
      liveConversationStore: LiveConversationStore,
      config: Config,
    ) => { exec: (...args: any[]) => Promise<any> },
    triggerBackgroundJobCheck: boolean,
  ): (...args: any[]) => Promise<any> {
    // Output schema is computed once per wiring and reused; valibot schemas
    // are immutable so this is safe to share.
    const outputSchema = makeResultSchema(
      contract.dataSchema,
      contract.errorSchemas,
    );
    return async (...args: any[]) => {
      // 1. Structural input validation.
      const argsResult = v.safeParse(contract.argumentsSchema, args);
      if (!argsResult.success) {
        return makeUnsuccessfulResult(
          makeResultError("ArgumentsNotValid", {
            issues: makeValidationIssues(argsResult.issues),
          }),
        );
      }

      // 2. Run the usecase, then validate output structurally.
      // Output validation failures collapse into UnexpectedError. Note: when
      // the success path's data fails schema validation the transaction has
      // already been committed — we do NOT roll back. The data is consistent
      // with what the usecase intended; only the wire shape is wrong.
      return this.dataRepositoriesManager
        .runInSerializableTransaction(async (repos) => {
          const usecase = new UsecaseClass(
            repos,
            this.javascriptSandbox,
            this.typescriptCompiler,
            this.inferenceServiceFactory,
            this.connectors,
            this.liveConversationStore,
            this.resolvedConfig,
          );
          const result = await usecase.exec(...args);
          return {
            action: result.success ? "commit" : "rollback",
            returnValue: result,
          };
        })
        .then((result) => {
          // Structural output validation.
          const outputResult = v.safeParse(outputSchema, result);
          if (!outputResult.success) {
            return makeUnsuccessfulResult(
              makeResultError("UnexpectedError", {
                cause: {
                  message: "Usecase output failed structural validation",
                  issues: makeValidationIssues(outputResult.issues),
                },
              }),
            );
          }
          // Trigger a background job check only _after_ the transaction has
          // been committed so the executor can see any newly-created jobs.
          if (triggerBackgroundJobCheck) {
            setTimeout(() => {
              this.backgroundJobExecutor.executeNext().catch((error) => {
                console.error("Error triggering next background job execution");
                console.error(error);
              });
            }, 0);
          }
          return result;
        })
        .catch((error) =>
          makeUnsuccessfulResult(
            makeResultError("UnexpectedError", {
              cause: extractErrorDetails(error),
            }),
          ),
        );
    };
  }
}
