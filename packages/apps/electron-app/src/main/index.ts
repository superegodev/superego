import { cli } from "@superego/cli";
import pkg from "../../package.json" with { type: "json" };

const cliArgIndex = process.argv.indexOf("--cli");

if (cliArgIndex !== -1) {
  startCliProcess(cliArgIndex);
} else {
  void startElectronProcess();
}

function startCliProcess(cliArgIndex: number): void {
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
      process.exit(Number.isFinite(exitCode) ? exitCode : 1);
    });
}

async function startElectronProcess(): Promise<void> {
  const [
    { app, BrowserWindow },
    { default: createWindow },
    { default: onReady },
    { default: registerAppSandboxProtocol },
  ] = await Promise.all([
    import("electron"),
    import("./createWindow.js"),
    import("./onReady.js"),
    import("./registerAppSandboxProtocol.js"),
  ]);

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
