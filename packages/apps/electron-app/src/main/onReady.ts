import type { BrowserWindow } from "electron";
import BackendIPCProxyServer from "../ipc-proxies/BackendIPCProxyServer.js";
import CliIPCProxyServer from "../ipc-proxies/CliIPCProxyServer.js";
import OpenFileWithNativeAppIPCProxyServer from "../ipc-proxies/OpenFileWithNativeAppIPCProxyServer.js";
import OpenInNativeBrowserIPCProxyServer from "../ipc-proxies/OpenInNativeBrowserIPCProxyServer.js";
import WindowCloseIPCProxyServer from "../ipc-proxies/WindowCloseIPCProxyServer.js";
import createBackend from "./createBackend.js";
import createWindow from "./createWindow.js";
import exportDatabase from "./exportDatabase.js";
import setApplicationMenu from "./setApplicationMenu.js";
import getIntl from "./translations/getIntl.js";

export default function onReady(): BrowserWindow {
  const intl = getIntl();
  const backend = createBackend();
  new BackendIPCProxyServer(backend).start();
  new OpenFileWithNativeAppIPCProxyServer(backend).start();
  new OpenInNativeBrowserIPCProxyServer().start();
  new WindowCloseIPCProxyServer().start();
  const menuHandlers = {
    onNewWindow: createWindow,
    onExportDatabase: () => exportDatabase(backend, intl),
  };
  const refreshApplicationMenu = () => setApplicationMenu(intl, menuHandlers);
  new CliIPCProxyServer(intl, refreshApplicationMenu).start();
  refreshApplicationMenu();
  return createWindow();
}
