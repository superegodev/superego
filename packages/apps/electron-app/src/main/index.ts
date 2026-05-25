import { cli } from "@superego/cli";
import { app, BrowserWindow } from "electron";
import pkg from "../../package.json" with { type: "json" };
import createWindow from "./createWindow.js";
import onReadyProd from "./onReadyProd.js";
import registerAppSandboxProtocol from "./registerAppSandboxProtocol.js";

startMainProcess();

function startMainProcess(): void {
  const cliArgIndex = process.argv.indexOf("--cli");
  const isCli = cliArgIndex !== -1;

  if (isCli) {
    const argv = [
      process.argv[0] ?? "superego-app",
      "superego",
      ...process.argv.slice(cliArgIndex + 1),
    ];

    cli({ version: pkg.version, argv })
      .catch((error: unknown) => {
        console.error(error instanceof Error ? error.message : String(error));
        process.exitCode = 1;
      })
      .finally(() => {
        const exitCode =
          process.exitCode === undefined ? 0 : Number(process.exitCode);
        app.exit(Number.isFinite(exitCode) ? exitCode : 1);
      });
  } else {
    registerAppSandboxProtocol();

    app
      .on("ready", () => {
        onReadyProd();
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
}
