import { app, BrowserWindow, ipcMain } from "electron";

let quitRequested = false;

export default class WindowCloseIPCProxyServer {
  start() {
    app.on("before-quit", (event) => {
      if (process.platform === "darwin") {
        const window = BrowserWindow.getFocusedWindow();
        if (window) {
          event.preventDefault();
          quitRequested = true;
          window.webContents.send("window-close-requested");
        }
      }
    });

    ipcMain.handle("window-close-confirmed", () => {
      const window = BrowserWindow.getFocusedWindow();
      if (window) {
        window.destroy();
      }
      if (quitRequested) {
        quitRequested = false;
        app.quit();
      }
    });
  }
}
