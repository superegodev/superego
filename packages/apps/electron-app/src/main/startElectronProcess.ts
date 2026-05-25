import { app, BrowserWindow } from "electron";
import createWindow from "./createWindow.js";
import onReady from "./onReady.js";
import registerAppSandboxProtocol from "./registerAppSandboxProtocol.js";

export default function startElectronProcess(): void {
  registerAppSandboxProtocol();

  app
    .on("ready", () => {
      onReady();
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
}
