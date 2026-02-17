import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

export default function discoverProtoCollections(basePath: string): string[] {
  return readdirSync(basePath)
    .filter(
      (name) =>
        name.startsWith("ProtoCollection_") &&
        statSync(join(basePath, name)).isDirectory(),
    )
    .sort();
}
