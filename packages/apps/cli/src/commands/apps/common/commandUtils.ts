import type {
  Collection,
  CollectionId,
  CollectionVersionId,
} from "@superego/backend";
import { isArgsFileError } from "../../../utils/argsFile.js";
import createBackend from "../../../utils/createBackend.js";
import {
  runCommand,
  successfulResult,
  unsuccessfulResult,
} from "../../../utils/results.js";
import type { TargetCollection } from "./types.js";

export type CliBackend = Awaited<ReturnType<typeof createBackend>>;

export async function runAppCommand<Data>(
  run: () => Promise<Data>,
): Promise<void> {
  await runCommand(async () => {
    try {
      return successfulResult(await run());
    } catch (error) {
      if (isArgsFileError(error)) {
        return unsuccessfulResult("ArgumentsNotValid", error.details);
      }
      return unsuccessfulResult("CommandFailed", {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });
}

export async function resolveLatestTargetCollections(
  backend: CliBackend,
  collectionIds: CollectionId[],
): Promise<TargetCollection[]> {
  const resolved: TargetCollection[] = [];
  for (const collectionId of collectionIds) {
    const result = await backend.collections.get(collectionId);
    if (!result.success) {
      throw new Error(JSON.stringify(result.error));
    }
    resolved.push(targetFromCollection(result.data));
  }
  return resolved;
}

export async function resolveLockedTargetCollections(
  backend: CliBackend,
  targetCollections: { id: CollectionId; versionId: string }[],
): Promise<TargetCollection[]> {
  const collectionsResult = await backend.collections.list();
  if (!collectionsResult.success) {
    throw new Error(JSON.stringify(collectionsResult.error));
  }
  const collectionsById = new Map(
    collectionsResult.data.map((collection) => [collection.id, collection]),
  );

  const resolved: TargetCollection[] = [];
  for (const targetCollection of targetCollections) {
    const collection = collectionsById.get(targetCollection.id);
    if (!collection) {
      throw new Error(`Collection ${targetCollection.id} not found.`);
    }
    const versionResult = await backend.collections.getVersion(
      targetCollection.id,
      targetCollection.versionId as CollectionVersionId,
    );
    if (!versionResult.success) {
      throw new Error(JSON.stringify(versionResult.error));
    }
    resolved.push({
      id: targetCollection.id,
      version: versionResult.data,
      displayName: collection.settings.name,
    });
  }
  return resolved;
}

export async function getLockedApp(backend: CliBackend, appId: string) {
  const result = await backend.apps.list();
  if (!result.success) {
    throw new Error(JSON.stringify(result.error));
  }
  const app = result.data.find((candidate) => candidate.id === appId);
  if (!app) {
    throw new Error(`App ${appId} not found.`);
  }
  return app;
}

export function sameArray(
  left: readonly string[],
  right: readonly string[],
): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function targetFromCollection(collection: Collection): TargetCollection {
  return {
    id: collection.id,
    version: collection.latestVersion,
    displayName: collection.settings.name,
  };
}
