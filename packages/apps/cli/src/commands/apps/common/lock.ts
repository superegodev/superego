import { existsSync } from "node:fs";
import { join } from "node:path";
import type { CollectionId } from "@superego/backend";
import { isRecord, readJson, writeJson } from "./json.js";
import type { AppLock } from "./types.js";

export function readLock(path: string): AppLock | null {
  const lockPath = join(path, "app.lock.json");
  if (!existsSync(lockPath)) {
    return null;
  }
  const data = readJson(lockPath);
  if (
    !isRecord(data) ||
    typeof data["appId"] !== "string" ||
    typeof data["latestAppVersionId"] !== "string" ||
    !Array.isArray(data["targetCollections"]) ||
    data["targetCollections"].some(
      (targetCollection) =>
        !isRecord(targetCollection) ||
        typeof targetCollection["id"] !== "string" ||
        typeof targetCollection["versionId"] !== "string",
    )
  ) {
    throw new Error("app.lock.json is invalid.");
  }
  return data as unknown as AppLock;
}

export function buildLock(app: {
  id: string;
  latestVersion: {
    id: string;
    targetCollections: { id: CollectionId; versionId: string }[];
  };
}): AppLock {
  return {
    appId: app.id,
    latestAppVersionId: app.latestVersion.id,
    targetCollections: app.latestVersion.targetCollections,
  };
}

export async function writeLock(path: string, lock: AppLock): Promise<void> {
  await writeJson(join(path, "app.lock.json"), lock);
}
