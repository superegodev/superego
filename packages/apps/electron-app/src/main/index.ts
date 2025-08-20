import { join } from "node:path";
import { AICompletionModel, Theme } from "@superego/backend";
import { ExecutingBackend } from "@superego/executing-backend";
import { QuickjsJavascriptSandbox } from "@superego/quickjs-javascript-sandbox/nodejs";
import { SqliteDataRepositoriesManager } from "@superego/sqlite-data-repositories";
import { app, BrowserWindow } from "electron";
import started from "electron-squirrel-startup";
import BackendIPCProxyServer from "../ipc-proxy/BackendIPCProxyServer.js";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

app
  .on("ready", () => {
    startBackendIPCProxyServer();
    createWindow();
  })
  .on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  })
  .on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  })
  .on("web-contents-created", (_event, contents) => {
    contents
      .on("will-navigate", (event) => {
        // Disable navigation. BrowserApp doesn't use navigation, so we don't
        // actually expect any navigation attempt. Still, if they occur, they
        // are probably erroneous and we want to prevent them.
        event.preventDefault();
      })
      .setWindowOpenHandler(() => {
        // Disable opening new windows. In the future, if necessary, consider
        // opening new windows for "external" URLs, like links, mailto-s, etc.
        return { action: "deny" };
      });
  });

function startBackendIPCProxyServer() {
  const dataRepositoriesManager = new SqliteDataRepositoriesManager({
    fileName: join(app.getPath("userData"), "superego.db"),
    defaultGlobalSettings: {
      appearance: { theme: Theme.Auto },
      ai: {
        providers: { groq: { apiKey: null, baseUrl: null } },
        completions: { defaultModel: AICompletionModel.GroqKimiK2Instruct },
      },
    },
  });
  dataRepositoriesManager.runMigrations();
  const javascriptSandbox = new QuickjsJavascriptSandbox();
  const backend = new ExecutingBackend(
    dataRepositoriesManager,
    javascriptSandbox,
  );
  const backendIPCProxyServer = new BackendIPCProxyServer(backend);
  backendIPCProxyServer.start();
}

const createWindow = () => {
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
};
