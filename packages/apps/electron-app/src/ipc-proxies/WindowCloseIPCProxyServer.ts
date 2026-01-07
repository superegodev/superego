import { BrowserWindow, ipcMain } from "electron";

export default class WindowCloseIPCProxyServer {
  start() {
    ipcMain.handle("window-close-confirmed", () => {
      const window = BrowserWindow.getFocusedWindow();
      if (window) {
        window.destroy();
      }
    });
  }
}
