import { readFileSync } from "node:fs";
import type { Pack } from "@superego/backend";
import { Command } from "commander";
import { app, BrowserWindow } from "electron";
import BackendIPCProxyServer from "../ipc-proxies/BackendIPCProxyServer.js";
import OpenFileWithNativeAppIPCProxyServer from "../ipc-proxies/OpenFileWithNativeAppIPCProxyServer.js";
import OpenInNativeBrowserIPCProxyServer from "../ipc-proxies/OpenInNativeBrowserIPCProxyServer.js";
import WindowCloseIPCProxyServer from "../ipc-proxies/WindowCloseIPCProxyServer.js";
import { OAUTH2_PKCE_CALLBACK_SERVER_PORT } from "./config.js";
import createBackend from "./createBackend.js";
import createWindow from "./createWindow.js";
import registerAppSandboxProtocol from "./registerAppSandboxProtocol.js";
import setApplicationMenu from "./setApplicationMenu.js";
import startOAuth2PKCECallbackServer from "./startOAuth2PKCECallbackServer.js";
import getIntl from "./translations/getIntl.js";

registerAppSandboxProtocol();

const program = new Command();
program
  .option("--ephemeral", "Start in ephemeral mode with in-memory storage")
  .option("--pack-file <path>", "Path to a pack JSON file to install on startup")
  .allowUnknownOption()
  .parse(process.argv, { from: "electron" });

const opts = program.opts<{ ephemeral?: boolean; packFile?: string }>();
const isEphemeral = opts.ephemeral === true;
const packFilePath = opts.packFile ?? null;

app
  .on("ready", async () => {
    const backend = createBackend(OAUTH2_PKCE_CALLBACK_SERVER_PORT, {
      ephemeral: isEphemeral,
    });

    if (!isEphemeral) {
      startOAuth2PKCECallbackServer(OAUTH2_PKCE_CALLBACK_SERVER_PORT, backend);
    }

    if (isEphemeral && packFilePath) {
      const packJson = readFileSync(packFilePath, "utf-8");
      const pack: Pack = JSON.parse(packJson);
      const result = await backend.packs.install(pack);
      if (!result.success) {
        console.error("Failed to install pack:", result.error);
        app.quit();
        return;
      }
      console.log("Pack installed successfully.");
    }

    new BackendIPCProxyServer(backend).start();
    new OpenFileWithNativeAppIPCProxyServer(backend).start();
    new OpenInNativeBrowserIPCProxyServer().start();
    new WindowCloseIPCProxyServer().start();
    const intl = getIntl();
    setApplicationMenu(intl, { onNewWindow: createWindow });
    createWindow();
  })
  .on("window-all-closed", () => {
    if (isEphemeral || process.platform !== "darwin") {
      app.quit();
    }
  })
  .on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  })
  .on("web-contents-created", (_event, contents) => {
    contents.on("will-navigate", (event) => {
      // Disable navigation. BrowserApp doesn't use navigation, so we don't
      // actually expect any navigation attempt. Still, if they occur, they
      // are probably erroneous and we want to prevent them.
      event.preventDefault();
    });
  });
