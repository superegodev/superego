import { homedir } from "node:os";
import { join } from "node:path";

export default function getAppDatabasePath(): string {
  const home = homedir();

  switch (process.platform) {
    case "darwin":
      return join(
        home,
        "Library",
        "Application Support",
        "superego",
        "superego.db",
      );
    case "win32":
      return join(
        process.env["APPDATA"] ?? join(home, "AppData", "Roaming"),
        "superego",
        "superego.db",
      );
    default:
      return join(
        process.env["XDG_CONFIG_HOME"] ?? join(home, ".config"),
        "superego",
        "superego.db",
      );
  }
}
