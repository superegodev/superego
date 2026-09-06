import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { AppStateDefinition } from "@superego/backend";
import { regenerateGeneratedFiles } from "./generatedFiles.js";
import { writeJson } from "./json.js";
import { writeStateSource } from "./state.js";
import type { AppLock, AppManifest, TargetCollection } from "./types.js";

export default async function writeAppProject(
  path: string,
  manifest: AppManifest,
  mainSource: string,
  targetCollections: TargetCollection[],
  lock: AppLock | null,
  state: AppStateDefinition,
): Promise<void> {
  await mkdir(path, { recursive: true });
  await writeJson(join(path, "app.json"), manifest);
  if (lock) {
    await writeJson(join(path, "app.lock.json"), lock);
  }
  await writeFile(join(path, "main.tsx"), mainSource, "utf-8");
  await writeStateSource(path, state);
  await regenerateGeneratedFiles(path, targetCollections);
}
