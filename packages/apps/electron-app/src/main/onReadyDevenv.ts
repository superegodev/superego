import { DevenvSignalType, readDevenvSignals } from "@superego/cli";
import { app, BrowserWindow, dialog } from "electron";
import BackendIPCProxyServer from "../ipc-proxies/BackendIPCProxyServer.js";
import OpenFileWithNativeAppIPCProxyServer from "../ipc-proxies/OpenFileWithNativeAppIPCProxyServer.js";
import OpenInNativeBrowserIPCProxyServer from "../ipc-proxies/OpenInNativeBrowserIPCProxyServer.js";
import WindowCloseIPCProxyServer from "../ipc-proxies/WindowCloseIPCProxyServer.js";
import { OAUTH2_PKCE_CALLBACK_SERVER_PORT } from "./config.js";
import createBackend from "./createBackend.js";
import createWindow from "./createWindow.js";
import setApplicationMenu from "./setApplicationMenu.js";
import getIntl from "./translations/getIntl.js";

export default async function onReadyDevenv(): Promise<void> {
  const intl = getIntl();

  let backendIPCProxyServer: BackendIPCProxyServer | null = null;
  let openFileIPCProxyServer: OpenFileWithNativeAppIPCProxyServer | null = null;

  for await (const devenvSignal of readDevenvSignals()) {
    if (devenvSignal.type === DevenvSignalType.PreviewPack) {
      const backend = createBackend(OAUTH2_PKCE_CALLBACK_SERVER_PORT, true);
      const result = await backend.packs.install(devenvSignal.pack);
      if (!result.success) {
        if (!backendIPCProxyServer) {
          dialog.showErrorBox(
            "Failed to install pack",
            JSON.stringify(result.error, null, 2),
          );
          app.quit();
          return;
        }
        dialog.showErrorBox(
          "Failed to install pack",
          JSON.stringify(result.error, null, 2),
        );
        continue;
      }

      if (!backendIPCProxyServer) {
        backendIPCProxyServer = new BackendIPCProxyServer(backend);
        backendIPCProxyServer.start();
        openFileIPCProxyServer = new OpenFileWithNativeAppIPCProxyServer(
          backend,
        );
        openFileIPCProxyServer.start();
        new OpenInNativeBrowserIPCProxyServer().start();
        new WindowCloseIPCProxyServer().start();
        setApplicationMenu(intl, { onNewWindow: () => createWindow(true) });
        createWindow(true);
      } else {
        backendIPCProxyServer.replaceBackend(backend);
        openFileIPCProxyServer!.replaceBackend(backend);
        const newWindow = createWindow(true);
        for (const win of BrowserWindow.getAllWindows()) {
          if (win !== newWindow) {
            win.destroy();
          }
        }
      }
    }
  }
}
