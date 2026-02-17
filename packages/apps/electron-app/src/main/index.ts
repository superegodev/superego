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

const intl = getIntl();

app
  .on("ready", () => {
    const backend = createBackend(OAUTH2_PKCE_CALLBACK_SERVER_PORT);
    startOAuth2PKCECallbackServer(OAUTH2_PKCE_CALLBACK_SERVER_PORT, backend);
    new BackendIPCProxyServer(backend).start();
    new OpenFileWithNativeAppIPCProxyServer(backend).start();
    new OpenInNativeBrowserIPCProxyServer().start();
    new WindowCloseIPCProxyServer().start();
    setApplicationMenu(intl, { onNewWindow: createWindow });
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
    contents.on("will-navigate", (event) => {
      // Disable navigation. BrowserApp doesn't use navigation, so we don't
      // actually expect any navigation attempt. Still, if they occur, they
      // are probably erroneous and we want to prevent them.
      event.preventDefault();
    });
  });
