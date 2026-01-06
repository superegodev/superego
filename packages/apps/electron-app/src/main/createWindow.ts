import { join } from "node:path";
import { app, BrowserWindow, shell } from "electron";

export default function createWindow() {
  const mainWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: join(import.meta.dirname, "../preload/index.js"),
    },
    icon: process.platform === "linux" ? "../../assets/icon.png" : undefined,
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    try {
      if (["https:", "http:"].includes(new URL(url).protocol)) {
        shell.openExternal(url);
      } else {
        console.warn(
          `Blocked attempt to open URL with unsafe protocol: ${url}`,
        );
      }
    } catch {
      console.warn(`Blocked attempt to open invalid URL: ${url}`);
    }
    return { action: "deny" };
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
