import { ipcRenderer } from "electron";

export default function OpenInNativeBrowserIPCProxyClient() {
  return (url: string) => ipcRenderer.invoke("openInNativeBrowser", url);
}
