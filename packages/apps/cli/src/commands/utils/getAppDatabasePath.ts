import { homedir } from "node:os";
import { join } from "node:path";

export default function getAppDatabasePath(): string {
  return join(homedir(), ".superego", "superego.db");
}
