import { join } from "node:path";
import { app, BrowserWindow } from "electron";

export default function createWindow() {
  const mainWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: join(import.meta.dirname, "../preload/index.js"),
    },
  });
  mainWindow.maximize();
  mainWindow.show();
  // HMR for renderer base on electron-vite cli. Load the remote URL for
  // development or the local html file for production.
  if (!app.isPackaged && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(import.meta.dirname, "../renderer/index.html"));
  }
}
