import { join } from "node:path";
import Log from "../utils/Log.js";

export default function getSuperegoAppBin(): string {
  const binName = "superego-app";

  if (process.platform === "darwin") {
    const appBundleMatch = __dirname.match(/^(.*?\.app)\b/);
    if (!appBundleMatch?.[1]) {
      Log.error("Not in an app bundle. Cannot locate superego-app binary.");
      process.exit(1);
    }
    return join(appBundleMatch[1], "Contents", "MacOS", binName);
  }
  if (process.platform === "linux") {
    const appDir = process.env["APPDIR"];
    return appDir ? join(appDir, binName) : binName;
  }

  throw new Error("Unsupported platform");
}
