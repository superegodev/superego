import type { Backend } from "@superego/backend";
import { ipcMain } from "electron";

type MethodNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

type ResourceNames<T> = { [K in keyof T]: K }[keyof T];

export default class BackendIPCProxyServer {
  constructor(private backend: Backend) {}

  start() {
    this.registerExecutingBackendIPCHandlers();
  }

  private registerExecutingBackendIPCHandlers() {
    this.registerIPCHandler(this.backend, "collectionCategories");
    this.registerIPCHandler(this.backend, "collections");
    this.registerIPCHandler(this.backend, "documents");
    this.registerIPCHandler(this.backend, "files");
    this.registerIPCHandler(this.backend, "globalSettings");
  }

  private registerIPCHandler<T>(instance: T, resourceName: ResourceNames<T>) {
    const resource = instance[resourceName] as T[ResourceNames<T>];
    if (!resource) {
      throw new Error(`Resource ${resourceName.toString()} does not exist.`);
    }
    const methodNames = Object.keys(resource) as MethodNames<
      T[ResourceNames<T>]
    >[];
    for (const action of methodNames) {
      const channel = `${resourceName.toString()}.${action.toString()}`;
      ipcMain.handle(channel, async (_event, ...args) => {
        const method = (resource as any)[action];
        return method(...args);
      });
    }
  }
}
