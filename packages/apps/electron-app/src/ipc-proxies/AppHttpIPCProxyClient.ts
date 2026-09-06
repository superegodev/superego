import type { AppHttpRuntime } from "@superego/backend";
import { appHttpFailure } from "@superego/shared-utils";
import { ipcRenderer } from "electron";

export default function AppHttpIPCProxyClient(): AppHttpRuntime {
  return {
    request: async (request, allowedOrigins) => {
      try {
        return await ipcRenderer.invoke(
          "appHttp.request",
          request,
          allowedOrigins,
        );
      } catch {
        return appHttpFailure("TransportFailure");
      }
    },
  };
}
