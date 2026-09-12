import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { AppStateDefinition } from "@superego/backend";
import { regenerateGeneratedFiles } from "./generatedFiles.js";
import { writeJson } from "./json.js";
import { writeStateDefinitionSource } from "./stateDefinition.js";
import type { AppLock, AppManifest, TargetCollection } from "./types.js";

export default async function writeAppProject(
  path: string,
  manifest: AppManifest,
  mainSource: string,
  targetCollections: TargetCollection[],
  lock: AppLock | null,
  stateDefinition: AppStateDefinition,
): Promise<void> {
  await mkdir(path, { recursive: true });
  await writeJson(join(path, "app.json"), manifest);
  if (lock) {
    await writeJson(join(path, "app.lock.json"), lock);
  }
  await writeFile(join(path, "main.tsx"), mainSource, "utf-8");
  await writeStateDefinitionSource(path, stateDefinition);
  await regenerateGeneratedFiles(path, targetCollections);
}
