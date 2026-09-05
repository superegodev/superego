import type { Backend } from "@superego/backend";
import { ipcMain } from "electron";

export default class BackendIPCProxyServer {
  constructor(
    private backend: Backend,
    private onAppsChanged: () => Promise<void>,
  ) {}

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
      "boutique",
      "backgroundJobs",
      "globalSettings",
      "database",
    ];
    for (const domainName of domainNames) {
      const methodNames = Object.keys(this.backend[domainName]) as string[];
      for (const methodName of methodNames) {
        const channel = `${domainName}.${methodName}`;
        ipcMain.handle(channel, async (event, ...args) => {
          if (event.senderFrame !== event.sender.mainFrame) {
            throw new Error("Untrusted frame");
          }
          const domain = this.backend[domainName] as any;
          const result = await domain[methodName](...args);
          if (
            domainName === "apps" &&
            !["list", "getState"].includes(methodName) &&
            result.success
          ) {
            await this.onAppsChanged();
          }
          return result;
        });
      }
    }
  }
}
