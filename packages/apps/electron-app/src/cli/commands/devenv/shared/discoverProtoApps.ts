import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

export default function discoverProtoApps(basePath: string): string[] {
  return readdirSync(basePath)
    .filter(
      (name) =>
        name.startsWith("ProtoApp_") &&
        statSync(join(basePath, name)).isDirectory(),
    )
    .sort();
}
