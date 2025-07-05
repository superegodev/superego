import type { Backend, RpcResultPromise } from "@superego/backend";
import makeRpcError from "./makers/makeRpcError.js";
import makeUnsuccessfulRpcResult from "./makers/makeUnsuccessfulRpcResult.js";
import type DataRepositories from "./requirements/DataRepositories.js";
import type DataRepositoriesManager from "./requirements/DataRepositoriesManager.js";
import type JavascriptSandbox from "./requirements/JavascriptSandbox.js";
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
  globalSettings: Backend["globalSettings"];

  constructor(
    private dataRepositoriesManager: DataRepositoriesManager,
    private javascriptSandbox: JavascriptSandbox,
  ) {
    this.collectionCategories = {
      create: this.makeUsecase(CollectionCategoriesCreate),
      update: this.makeUsecase(CollectionCategoriesUpdate),
      delete: this.makeUsecase(CollectionCategoriesDelete),
      list: this.makeUsecase(CollectionCategoriesList),
    };

    this.collections = {
      create: this.makeUsecase(CollectionsCreate),
      createNewVersion: this.makeUsecase(CollectionsCreateNewVersion),
      list: this.makeUsecase(CollectionsList),
      delete: this.makeUsecase(CollectionsDelete),
      updateSettings: this.makeUsecase(CollectionsUpdateSettings),
      updateLatestVersionSettings: this.makeUsecase(
        CollectionUpdateLatestVersionSettings,
      ),
    };

    this.documents = {
      create: this.makeUsecase(DocumentsCreate),
      createNewVersion: this.makeUsecase(DocumentsCreateNewVersion),
      get: this.makeUsecase(DocumentsGet),
      list: this.makeUsecase(DocumentsList),
      delete: this.makeUsecase(DocumentsDelete),
    };

    this.files = {
      getContent: this.makeUsecase(FilesGetContent),
    };

    this.globalSettings = {
      get: this.makeUsecase(GlobalSettingsGet),
      update: this.makeUsecase(GlobalSettingsUpdate),
    };
  }

  private makeUsecase<
    Exec extends (...args: any[]) => RpcResultPromise<any, any>,
  >(
    Usecase: new (
      repos: DataRepositories,
      javascriptSandbox: JavascriptSandbox,
    ) => { exec: Exec },
  ) {
    return async (...args: any[]) =>
      this.dataRepositoriesManager
        .runInSerializableTransaction(async (dataRepositories) => {
          const usecase = new Usecase(dataRepositories, this.javascriptSandbox);
          const rpcResult = await usecase.exec(...args);
          return {
            action: rpcResult.success ? "commit" : "rollback",
            returnValue: rpcResult,
          };
        })
        .catch((error) =>
          makeUnsuccessfulRpcResult(
            makeRpcError("UnexpectedError", { cause: error }),
          ),
        );
  }
}
