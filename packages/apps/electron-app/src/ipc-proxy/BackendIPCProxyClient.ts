import type { Backend } from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { ipcRenderer } from "electron";

export default class BackendIPCProxyClient implements Backend {
  collectionCategories: Backend["collectionCategories"];
  collections: Backend["collections"];
  documents: Backend["documents"];
  files: Backend["files"];
  assistants: Backend["assistants"];
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
      createNewVersion: this.makeMainIpcCall("collections.createNewVersion"),
      list: this.makeMainIpcCall("collections.list"),
      delete: this.makeMainIpcCall("collections.delete"),
      updateSettings: this.makeMainIpcCall("collections.updateSettings"),
      updateLatestVersionSettings: this.makeMainIpcCall(
        "collections.updateLatestVersionSettings",
      ),
    };

    this.documents = {
      create: this.makeMainIpcCall("documents.create"),
      createNewVersion: this.makeMainIpcCall("documents.createNewVersion"),
      get: this.makeMainIpcCall("documents.get"),
      getVersion: this.makeMainIpcCall("documents.getVersion"),
      list: this.makeMainIpcCall("documents.list"),
      delete: this.makeMainIpcCall("documents.delete"),
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
      getDeveloperPrompts: this.makeMainIpcCall(
        "assistants.getDeveloperPrompts",
      ),
      tts: this.makeMainIpcCall("assistants.tts"),
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
        throw new Error(`IPC call to ${channel} failed`, { cause: error });
      }
    };
  }
}
