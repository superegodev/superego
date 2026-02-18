import { spawn } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import Log from "../shared/log.js";
import compilePack from "./compilePack.js";

function getAppBinaryPath(): string {
  const productName = "superego";

  // Check if we're running from inside a packaged .app bundle (macOS)
  const appBundleMatch = __dirname.match(/^(.*?\.app)\b/);
  if (appBundleMatch?.[1]) {
    return join(appBundleMatch[1], "Contents", "MacOS", productName);
  }

  // Otherwise, find the packaged app relative to the electron-app package root
  // (from dist/cli/ go up two levels)
  const appRoot = join(__dirname, "..", "..");
  const platform = process.platform;
  const arch = process.arch;

  let binaryPath: string;
  if (platform === "darwin") {
    binaryPath = join(
      appRoot,
      "out",
      `${productName}-darwin-${arch}`,
      `${productName}.app`,
      "Contents",
      "MacOS",
      productName,
    );
  } else if (platform === "win32") {
    binaryPath = join(
      appRoot,
      "out",
      `${productName}-win32-${arch}`,
      `${productName}.exe`,
    );
  } else {
    binaryPath = join(
      appRoot,
      "out",
      `${productName}-linux-${arch}`,
      productName,
    );
  }

  if (!existsSync(binaryPath)) {
    Log.error(`Cannot find the Superego app at: ${binaryPath}`);
    Log.error(`Run "yarn build" in the electron-app package first.`);
    process.exit(1);
  }

  return binaryPath;
}

export default async function previewAction(): Promise<void> {
  const basePath = resolve(process.cwd());

  Log.info("Compiling pack...");
  const pack = await compilePack(basePath);
  Log.info("Pack compiled successfully.");

  // Write pack to temp file
  const packFilePath = join(tmpdir(), `superego-pack-${Date.now()}.json`);
  writeFileSync(packFilePath, JSON.stringify(pack));

  const appBinaryPath = getAppBinaryPath();

  Log.info("Starting Superego in ephemeral mode...");
  const child = spawn(
    appBinaryPath,
    ["--ephemeral", "--pack-file", packFilePath],
    { stdio: "ignore" },
  );

  child.on("close", (code) => {
    process.exit(code ?? 0);
  });
}
