import { ipcMain, shell } from "electron";

export default class OpenInNativeBrowserIPCProxyServer {
  start() {
    ipcMain.handle("openInNativeBrowser", (_event, url: string) => {
      shell.openExternal(url);
    });
  }
}
