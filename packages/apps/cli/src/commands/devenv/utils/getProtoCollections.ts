import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

export default function getProtoCollections(basePath: string): string[] {
  return readdirSync(basePath)
    .filter(
      (name) =>
        name.startsWith("ProtoCollection_") &&
        statSync(join(basePath, name)).isDirectory(),
    )
    .sort((a, b) => Number(a.split("_")[1]) - Number(b.split("_")[1]));
}
