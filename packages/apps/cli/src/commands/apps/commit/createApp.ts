import { resolveLatestTargetCollections } from "../common/commandUtils.js";
import { compileApp } from "../common/compile.js";
import { buildLock, writeLock } from "../common/lock.js";
import type { CommitContext, CommitResult } from "./types.js";

export default async function createApp({
  backend,
  path,
  manifest,
}: CommitContext): Promise<CommitResult> {
  const targetCollections = await resolveLatestTargetCollections(
    backend,
    manifest.targetCollectionIds,
  );
  const mainModule = await compileApp(path, targetCollections);
  const result = await backend.apps.create({
    type: manifest.type,
    name: manifest.name,
    targetCollectionIds: manifest.targetCollectionIds,
    files: { "/main.tsx": mainModule },
  });
  if (!result.success) {
    throw new Error(JSON.stringify(result.error));
  }
  await writeLock(path, buildLock(result.data));
  return { operations: ["created app"], appId: result.data.id };
}
