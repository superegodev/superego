import { spawn } from "node:child_process";
import { watch } from "node:fs";
import { resolve } from "node:path";
import debounce from "debounce";
import { sendPreviewPack } from "../../../../common/DevenvSignalCliMainIpc.js";
import Log from "../utils/Log.js";
import compilePack from "./compilePack.js";
import getAppBinaryPath from "./getAppBinaryPath.js";

export default async function previewAction(options: {
  watch?: boolean;
}): Promise<void> {
  const basePath = resolve(process.cwd());
  const appBinaryPath = getAppBinaryPath();

  Log.info("Compiling pack...");
  const pack = await compilePack(basePath);
  Log.info("Pack compiled successfully.");

  Log.info("Starting Superego in devenv mode...");
  const superegoAppProcess = spawn(appBinaryPath, ["--devenv"], {
    stdio: ["pipe", "ignore", "ignore"],
  });

  sendPreviewPack(superegoAppProcess.stdin!, pack);

  if (options.watch) {
    Log.info("Watching for changes...");
    const recompileAndReload = debounce(async () => {
      Log.info("Change detected, recompiling...");
      try {
        const newPack = await compilePack(basePath);
        Log.info("Pack compiled successfully. Reloading...");
        sendPreviewPack(superegoAppProcess.stdin!, newPack);
      } catch (error) {
        Log.error(
          `Compilation failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }, 500);
    watch(basePath, { recursive: true }, (_event, filename) => {
      if (filename && !filename.startsWith("generated/")) {
        recompileAndReload();
      }
    });
  }

  const killApp = () => superegoAppProcess.kill();
  process.on("SIGINT", killApp);
  process.on("SIGTERM", killApp);
  process.on("exit", killApp);

  superegoAppProcess.on("close", (code) => {
    process.exit(code ?? 0);
  });
}
