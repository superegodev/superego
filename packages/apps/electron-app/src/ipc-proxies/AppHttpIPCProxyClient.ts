import type { AppHttpRuntime } from "@superego/backend";
import { appHttpFailure } from "@superego/shared-utils";
import { ipcRenderer } from "electron";

export default function AppHttpIPCProxyClient(): AppHttpRuntime {
  return {
    open: async (appId, versionId) => {
      try {
        return await ipcRenderer.invoke("appHttp.open", appId, versionId);
      } catch {
        return appHttpFailure("TransportFailure");
      }
    },
    request: async (instanceId, request) => {
      try {
        return await ipcRenderer.invoke("appHttp.request", instanceId, request);
      } catch {
        return appHttpFailure("TransportFailure");
      }
    },
    close: (instanceId) => ipcRenderer.invoke("appHttp.close", instanceId),
    onAppsChanged: (callback) => {
      const listener = () => callback();
      ipcRenderer.on("apps.changed", listener);
      return () => {
        ipcRenderer.removeListener("apps.changed", listener);
      };
    },
  };
}
