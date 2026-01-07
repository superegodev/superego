import { contextBridge, ipcRenderer } from "electron";
import BackendIPCProxyClient from "../ipc-proxies/BackendIPCProxyClient.js";
import OpenInNativeBrowserIPCProxyClient from "../ipc-proxies/OpenInNativeBrowserIPCProxyClient.js";
import WindowCloseIPCProxyClient from "../ipc-proxies/WindowCloseIPCProxyClient.js";

contextBridge.exposeInMainWorld("backend", new BackendIPCProxyClient());
contextBridge.exposeInMainWorld(
  "openInNativeBrowser",
  OpenInNativeBrowserIPCProxyClient(),
);
contextBridge.exposeInMainWorld("isElectron", true);
contextBridge.exposeInMainWorld("windowClose", WindowCloseIPCProxyClient());
ipcRenderer.on("OAuth2PKCEFlowSucceeded", (_evt, data) => {
  window.postMessage(data, "*");
});
