import { join } from "node:path";
import { app, BrowserWindow, Menu, shell } from "electron";

export default function createWindow() {
  const mainWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: join(import.meta.dirname, "../preload/index.js"),
    },
    icon: process.platform === "linux" ? join(import.meta.dirname, "../../assets/icon.png") : undefined,
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

  mainWindow.webContents.on("context-menu", (_event, params) => {
    const menu = Menu.buildFromTemplate([
      { role: "cut", enabled: params.editFlags.canCut },
      { role: "copy", enabled: params.editFlags.canCopy },
      { role: "paste", enabled: params.editFlags.canPaste },
      { role: "selectAll", enabled: params.editFlags.canSelectAll },
    ]);
    menu.popup();
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
