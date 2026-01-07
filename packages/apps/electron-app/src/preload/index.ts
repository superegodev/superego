import { contextBridge, ipcRenderer } from "electron";
import BackendIPCProxyClient from "../ipc-proxies/BackendIPCProxyClient.js";
import OpenInNativeBrowserIPCProxyClient from "../ipc-proxies/OpenInNativeBrowserIPCProxyClient.js";

contextBridge.exposeInMainWorld("backend", new BackendIPCProxyClient());
contextBridge.exposeInMainWorld(
  "openInNativeBrowser",
  OpenInNativeBrowserIPCProxyClient(),
);
ipcRenderer.on("OAuth2PKCEFlowSucceeded", (_evt, data) => {
  window.postMessage(data, "*");
});
