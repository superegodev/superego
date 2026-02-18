import { spawn } from "node:child_process";
import chokidar from "chokidar";
import debounce from "debounce";
import { sendPreviewPack } from "../../../DevenvSignalCliMainIpc.js";
import compilePack from "../utils/compilePack.js";
import Log from "../utils/Log.js";
import getSuperegoAppBin from "./getSuperegoAppBin.js";

export default async function previewAction(options: {
  watch?: boolean;
}): Promise<void> {
  const basePath = process.cwd();
  const superegoAppBin = getSuperegoAppBin();

  Log.info("Compiling pack...");
  const pack = await compilePack(basePath);
  Log.info("Pack compiled successfully.");

  Log.info("Starting Superego in devenv mode...");
  const superegoAppProcess = spawn(superegoAppBin, ["--devenv"], {
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
    chokidar
      .watch(basePath, { ignored: /generated\//, ignoreInitial: true })
      .on("all", () => {
        recompileAndReload();
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
