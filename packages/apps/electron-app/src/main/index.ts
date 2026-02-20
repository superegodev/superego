import { app, BrowserWindow } from "electron";
import createWindow from "./createWindow.js";
import onReadyDevenv from "./onReadyDevenv.js";
import onReadyProd from "./onReadyProd.js";
import registerAppSandboxProtocol from "./registerAppSandboxProtocol.js";

registerAppSandboxProtocol();

const isDevenv = process.argv.includes("--devenv");

app
  .on("ready", () => {
    if (isDevenv) {
      onReadyDevenv();
    } else {
      onReadyProd();
    }
  })
  .on("window-all-closed", () => {
    if (isDevenv || process.platform !== "darwin") {
      app.quit();
    }
  })
  .on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(isDevenv);
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
