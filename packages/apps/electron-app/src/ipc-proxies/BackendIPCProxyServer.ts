import type { Backend } from "@superego/backend";
import { ipcMain } from "electron";

export default class BackendIPCProxyServer {
  constructor(private backend: Backend) {}

  start() {
    const domainNames: (keyof Backend)[] = [
      "collectionCategories",
      "collections",
      "documents",
      "files",
      "assistants",
      "inference",
      "apps",
      "packs",
      "bazaar",
      "backgroundJobs",
      "globalSettings",
    ];
    for (const domainName of domainNames) {
      const methodNames = Object.keys(this.backend[domainName]) as string[];
      for (const methodName of methodNames) {
        const channel = `${domainName}.${methodName}`;
        ipcMain.handle(channel, async (_event, ...args) => {
          const domain = this.backend[domainName] as any;
          return domain[methodName](...args);
        });
      }
    }
  }

  /** Used in devenv mode. */
  replaceBackend(backend: Backend) {
    this.backend = backend;
  }
}
