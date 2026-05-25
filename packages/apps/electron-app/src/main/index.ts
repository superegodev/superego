import pkg from "../../package.json" with { type: "json" };

const cliArgs = getCliArgs();

if (cliArgs) {
  void startCliProcess(cliArgs);
} else {
  void startElectronProcess();
}

function getCliArgs(): string[] | null {
  const separatorIndex = process.argv.findIndex(
    (argument) => argument === "--cli",
  );
  if (separatorIndex === -1) {
    return null;
  }
  return process.argv.slice(separatorIndex + 1);
}

async function startCliProcess(cliArgs: string[]): Promise<void> {
  const { cli } = await import("@superego/cli");
  const argv = [process.argv[0] ?? "superego-app", "superego", ...cliArgs];

  try {
    await cli({ version: pkg.version, argv });
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  } finally {
    const exitCode =
      process.exitCode === undefined ? 0 : Number(process.exitCode);
    process.exit(Number.isFinite(exitCode) ? exitCode : 1);
  }
}

async function startElectronProcess(): Promise<void> {
  const { app, BrowserWindow } = await import("electron");
  const { default: createWindow } = await import("./createWindow.js");
  const { default: onReady } = await import("./onReady.js");
  const { default: registerAppSandboxProtocol } =
    await import("./registerAppSandboxProtocol.js");

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
