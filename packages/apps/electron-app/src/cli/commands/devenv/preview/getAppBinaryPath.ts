import { existsSync } from "node:fs";
import { join } from "node:path";
import Log from "../utils/Log.js";

export default function getAppBinaryPath(): string {
  const binNameMacos = "superego";
  // TODO_DEVENV: check after CI build how it's on Linux.
  const binNameLinux = "superego-app";

  // Check if we're running from inside a packaged .app bundle (macOS).
  const appBundleMatch = __dirname.match(/^(.*?\.app)\b/);
  if (appBundleMatch?.[1]) {
    return join(appBundleMatch[1], "Contents", "MacOS", binNameMacos);
  }

  // Otherwise, find the packaged app relative to the electron-app package root
  // (from dist/cli/ go up two levels).
  const appRoot = join(__dirname, "..", "..");
  const platform = process.platform;
  const arch = process.arch;

  let binaryPath: string;
  if (platform === "darwin") {
    binaryPath = join(
      appRoot,
      "out",
      `${binNameMacos}-darwin-${arch}`,
      `${binNameMacos}.app`,
      "Contents",
      "MacOS",
      binNameMacos,
    );
  } else {
    binaryPath = join(
      appRoot,
      "out",
      `${binNameLinux}-linux-${arch}`,
      binNameLinux,
    );
  }

  if (!existsSync(binaryPath)) {
    Log.error(`Cannot find the Superego app at: ${binaryPath}`);
    process.exit(1);
  }

  return binaryPath;
}
