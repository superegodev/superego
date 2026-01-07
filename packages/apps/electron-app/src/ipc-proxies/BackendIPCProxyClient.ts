import type { Backend } from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  extractErrorDetails,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import { ipcRenderer } from "electron";

export default class BackendIPCProxyClient implements Backend {
  collectionCategories: Backend["collectionCategories"];
  collections: Backend["collections"];
  documents: Backend["documents"];
  files: Backend["files"];
  assistants: Backend["assistants"];
  inference: Backend["inference"];
  apps: Backend["apps"];
  backgroundJobs: Backend["backgroundJobs"];
  globalSettings: Backend["globalSettings"];

  constructor() {
    this.collectionCategories = {
      create: this.makeMainIpcCall("collectionCategories.create"),
      update: this.makeMainIpcCall("collectionCategories.update"),
      delete: this.makeMainIpcCall("collectionCategories.delete"),
      list: this.makeMainIpcCall("collectionCategories.list"),
    };

    this.collections = {
      create: this.makeMainIpcCall("collections.create"),
      updateSettings: this.makeMainIpcCall("collections.updateSettings"),
      setRemote: this.makeMainIpcCall("collections.setRemote"),
      getOAuth2PKCEConnectorAuthorizationRequestUrl: this.makeMainIpcCall(
        "collections.getOAuth2PKCEConnectorAuthorizationRequestUrl",
      ),
      authenticateOAuth2PKCEConnector: this.makeMainIpcCall(
        "collections.authenticateOAuth2PKCEConnector",
      ),
      triggerDownSync: this.makeMainIpcCall("collections.triggerDownSync"),
      createNewVersion: this.makeMainIpcCall("collections.createNewVersion"),
      updateLatestVersionSettings: this.makeMainIpcCall(
        "collections.updateLatestVersionSettings",
      ),
      delete: this.makeMainIpcCall("collections.delete"),
      list: this.makeMainIpcCall("collections.list"),
      listConnectors: this.makeMainIpcCall("collections.listConnectors"),
      getVersion: this.makeMainIpcCall("collections.getVersion"),
    };

    this.documents = {
      create: this.makeMainIpcCall("documents.create"),
      createNewVersion: this.makeMainIpcCall("documents.createNewVersion"),
      delete: this.makeMainIpcCall("documents.delete"),
      list: this.makeMainIpcCall("documents.list"),
      listVersions: this.makeMainIpcCall("documents.listVersions"),
      get: this.makeMainIpcCall("documents.get"),
      getVersion: this.makeMainIpcCall("documents.getVersion"),
      search: this.makeMainIpcCall("documents.search"),
    };

    this.files = {
      getContent: this.makeMainIpcCall("files.getContent"),
    };

    this.assistants = {
      startConversation: this.makeMainIpcCall("assistants.startConversation"),
      continueConversation: this.makeMainIpcCall(
        "assistants.continueConversation",
      ),
      retryLastResponse: this.makeMainIpcCall("assistants.retryLastResponse"),
      recoverConversation: this.makeMainIpcCall(
        "assistants.recoverConversation",
      ),
      deleteConversation: this.makeMainIpcCall("assistants.deleteConversation"),
      getConversation: this.makeMainIpcCall("assistants.getConversation"),
      listConversations: this.makeMainIpcCall("assistants.listConversations"),
      searchConversations: this.makeMainIpcCall(
        "assistants.searchConversations",
      ),
      getDeveloperPrompts: this.makeMainIpcCall(
        "assistants.getDeveloperPrompts",
      ),
    };

    this.inference = {
      stt: this.makeMainIpcCall("inference.stt"),
      tts: this.makeMainIpcCall("inference.tts"),
      implementTypescriptModule: this.makeMainIpcCall(
        "inference.implementTypescriptModule",
      ),
    };

    this.apps = {
      create: this.makeMainIpcCall("apps.create"),
      updateName: this.makeMainIpcCall("apps.updateName"),
      createNewVersion: this.makeMainIpcCall("apps.createNewVersion"),
      delete: this.makeMainIpcCall("apps.delete"),
      list: this.makeMainIpcCall("apps.list"),
    };

    this.backgroundJobs = {
      list: this.makeMainIpcCall("backgroundJobs.list"),
    };

    this.globalSettings = {
      get: this.makeMainIpcCall("globalSettings.get"),
      update: this.makeMainIpcCall("globalSettings.update"),
    };
  }

  private makeMainIpcCall(
    channel: string,
  ): (...args: any[]) => ResultPromise<any, any> {
    return async (...args: any[]): ResultPromise<any, any> => {
      try {
        return await ipcRenderer.invoke(channel, ...args);
      } catch (error) {
        return makeUnsuccessfulResult({
          name: "UnexpectedError",
          details: {
            message: `IPC call to ${channel} failed`,
            cause: extractErrorDetails(error),
          },
        });
      }
    };
  }
}
