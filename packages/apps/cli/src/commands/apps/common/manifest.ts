import { join } from "node:path";
import { AppType, type CollectionId } from "@superego/backend";
import { isRecord, readJson, writeJson } from "./json.js";
import type { AppManifest } from "./types.js";

export function readManifest(path: string): AppManifest {
  const data = readJson(join(path, "app.json"));
  if (
    !isRecord(data) ||
    typeof data["name"] !== "string" ||
    data["type"] !== AppType.CollectionView ||
    !Array.isArray(data["targetCollectionIds"]) ||
    data["targetCollectionIds"].some((id) => typeof id !== "string")
  ) {
    throw new Error("app.json is invalid.");
  }
  return {
    name: data["name"],
    type: AppType.CollectionView,
    targetCollectionIds: data["targetCollectionIds"] as CollectionId[],
  };
}

export async function writeManifest(
  path: string,
  manifest: AppManifest,
): Promise<void> {
  await writeJson(join(path, "app.json"), manifest);
}
