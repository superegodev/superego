import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { regenerateGeneratedFiles } from "./generatedFiles.js";
import { writeJson } from "./json.js";
import type { AppLock, AppManifest, TargetCollection } from "./types.js";

export default async function writeAppProject(
  path: string,
  manifest: AppManifest,
  mainSource: string,
  targetCollections: TargetCollection[],
  lock: AppLock | null,
  spec: string,
): Promise<void> {
  await mkdir(path, { recursive: true });
  await writeJson(join(path, "app.json"), manifest);
  if (lock) {
    await writeJson(join(path, "app.lock.json"), lock);
  }
  await writeFile(join(path, "main.tsx"), mainSource, "utf-8");
  await writeFile(join(path, "spec.md"), spec, "utf-8");
  await regenerateGeneratedFiles(path, targetCollections);
}
