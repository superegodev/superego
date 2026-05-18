import { resolve } from "node:path";
import { AppType, type Collection, type CollectionId } from "@superego/backend";
import { Command } from "commander";
import { createCliBackend } from "../shared/backend.js";
import { useMarkdownHelp } from "../shared/markdownHelp.js";
import {
  runCommand,
  successfulResult,
  unsuccessfulResult,
} from "../shared/results.js";
import {
  assertEmptyTarget,
  buildLock,
  compileApp,
  getInitialMainSource,
  readLock,
  readMainSource,
  readManifest,
  regenerateGeneratedFiles,
  type TargetCollection,
  writeAppProject,
  writeLock,
  writeManifest,
} from "./appProject.js";

const apps = useMarkdownHelp(new Command("apps").description("Manage apps"), {
  relatedCommands: [
    "superego apps init --help",
    "superego apps checkout --help",
    "superego apps check --help",
    "superego apps commit --help",
  ],
});

type CliBackend = Awaited<ReturnType<typeof createCliBackend>>;

apps.addCommand(
  useMarkdownHelp(
    new Command("init")
      .description("Create a new local app project")
      .argument("<path>", "New project path")
      .option("--name <name>", "App name", "Untitled App")
      .option("--collection <collectionId>", "Target collection", collect, [])
      .action(
        async (
          path: string,
          options: { name: string; collection: CollectionId[] },
        ) => {
          await runAppCommand(async () => {
            const projectPath = resolve(path);
            assertEmptyTarget(projectPath);
            const backend = await createCliBackend();
            const targetCollections = await resolveLatestTargetCollections(
              backend,
              options.collection,
            );
            const manifest = {
              name: options.name,
              type: AppType.CollectionView,
              targetCollectionIds: options.collection,
            };
            await writeAppProject(
              projectPath,
              manifest,
              getInitialMainSource(targetCollections),
              targetCollections,
              null,
            );
            return {
              path: projectPath,
              targetCollectionIds: options.collection,
            };
          });
        },
      ),
    {
      outputShape:
        '{ "success": true, "data": { "path": "...", "targetCollectionIds": [] } }',
      sideEffects: [
        "Creates an app project directory.",
        "Does not create a backend app.",
      ],
      failureCases: [
        "Target path exists and is not empty.",
        "A supplied collection id does not exist.",
      ],
    },
  ),
);

apps.addCommand(
  useMarkdownHelp(
    new Command("checkout")
      .description("Check out an existing backend app into a local folder")
      .argument("<path>", "New project path")
      .argument("<appId>", "Backend app id")
      .action(async (path: string, appId: string) => {
        await runAppCommand(async () => {
          const projectPath = resolve(path);
          assertEmptyTarget(projectPath);
          const backend = await createCliBackend();
          const appsResult = await backend.apps.list();
          if (!appsResult.success) {
            throw new Error(JSON.stringify(appsResult.error));
          }
          const app = appsResult.data.find(
            (candidate) => candidate.id === appId,
          );
          if (!app) {
            throw new Error(`App ${appId} not found.`);
          }
          const targetCollections = await resolveLockedTargetCollections(
            backend,
            app.latestVersion.targetCollections,
          );
          await writeAppProject(
            projectPath,
            {
              name: app.name,
              type: app.type,
              targetCollectionIds: app.latestVersion.targetCollections.map(
                (targetCollection) => targetCollection.id,
              ),
            },
            app.latestVersion.files["/main.tsx"].source,
            targetCollections,
            buildLock(app),
          );
          return { path: projectPath, appId: app.id };
        });
      }),
    {
      outputShape:
        '{ "success": true, "data": { "path": "...", "appId": "App_..." } }',
      sideEffects: [
        "Creates an app project directory.",
        "Does not mutate the backend.",
      ],
      failureCases: [
        "Target path exists and is not empty.",
        "App id does not exist.",
        "A target collection version is missing.",
      ],
    },
  ),
);

apps.addCommand(
  useMarkdownHelp(
    new Command("check")
      .description("Validate and compile the local app project")
      .action(async () => {
        await runAppCommand(async () => {
          const path = process.cwd();
          const manifest = readManifest(path);
          readLock(path);
          readMainSource(path);
          const backend = await createCliBackend();
          const targetCollections = await resolveLatestTargetCollections(
            backend,
            manifest.targetCollectionIds,
          );
          await compileApp(path, targetCollections);
          return {
            path,
            targetCollectionIds: manifest.targetCollectionIds,
            compiled: true,
          };
        });
      }),
    {
      outputShape: '{ "success": true, "data": { "compiled": true } }',
      sideEffects: ["None."],
      failureCases: [
        "app.json is missing or invalid.",
        "app.lock.json is invalid.",
        "main.tsx is missing.",
        "A target collection is missing.",
        "TypeScript compilation fails.",
      ],
    },
  ),
);

apps.addCommand(
  useMarkdownHelp(
    new Command("status")
      .description("Compare the local app project with the database")
      .action(async () => {
        await runAppCommand(async () => {
          const path = process.cwd();
          const manifest = readManifest(path);
          const lock = readLock(path);
          const source = readMainSource(path);
          if (!lock) {
            return { status: ["new app"] };
          }
          const backend = await createCliBackend();
          const app = await getLockedApp(backend, lock.appId);
          const status: string[] = [];
          if (
            manifest.name !== app.name ||
            !sameArray(
              manifest.targetCollectionIds,
              app.latestVersion.targetCollections.map(
                (targetCollection) => targetCollection.id,
              ),
            )
          ) {
            status.push("metadata changed");
          }
          if (source !== app.latestVersion.files["/main.tsx"].source) {
            status.push("source changed");
          }
          if (lock.latestAppVersionId !== app.latestVersion.id) {
            status.push("checkout stale");
          }
          if (status.length === 0) {
            status.push("clean");
          }
          return {
            status,
            appId: lock.appId,
            lockedLatestAppVersionId: lock.latestAppVersionId,
            databaseLatestAppVersionId: app.latestVersion.id,
          };
        });
      }),
    {
      outputShape: '{ "success": true, "data": { "status": ["clean"] } }',
      sideEffects: ["None."],
      failureCases: ["Local project invalid.", "Locked app no longer exists."],
    },
  ),
);

apps.addCommand(
  useMarkdownHelp(
    new Command("commit")
      .description("Create or update the backend app from the local project")
      .action(async () => {
        await runAppCommand(async () => {
          const path = process.cwd();
          const manifest = readManifest(path);
          const lock = readLock(path);
          const backend = await createCliBackend();
          const targetCollections = await resolveLatestTargetCollections(
            backend,
            manifest.targetCollectionIds,
          );
          const mainModule = await compileApp(path, targetCollections);
          const operations: string[] = [];

          if (!lock) {
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
            operations.push("created app");
            return { operations, appId: result.data.id };
          }

          let app = await getLockedApp(backend, lock.appId);
          if (lock.latestAppVersionId !== app.latestVersion.id) {
            throw new Error(
              "Checkout is stale. Run apps status and checkout again.",
            );
          }
          if (manifest.name !== app.name) {
            const result = await backend.apps.updateName(app.id, manifest.name);
            if (!result.success) {
              throw new Error(JSON.stringify(result.error));
            }
            app = result.data;
            operations.push("updated name");
          }

          const targetCollectionIds = app.latestVersion.targetCollections.map(
            (targetCollection) => targetCollection.id,
          );
          if (
            mainModule.source !== app.latestVersion.files["/main.tsx"].source ||
            !sameArray(manifest.targetCollectionIds, targetCollectionIds)
          ) {
            const result = await backend.apps.createNewVersion(
              app.id,
              manifest.targetCollectionIds,
              { "/main.tsx": mainModule },
            );
            if (!result.success) {
              throw new Error(JSON.stringify(result.error));
            }
            app = result.data;
            operations.push("created new version");
          }

          if (operations.length === 0) {
            operations.push("nothing to commit");
          }
          await writeLock(path, buildLock(app));
          return { operations, appId: app.id };
        });
      }),
    {
      outputShape: '{ "success": true, "data": { "operations": [] } }',
      sideEffects: [
        "May create an app, update its name, or create a new app version.",
      ],
      failureCases: [
        "Local project invalid.",
        "Checkout is stale.",
        "TypeScript compilation fails.",
        "Backend mutation fails.",
      ],
    },
  ),
);

apps.addCommand(
  useMarkdownHelp(
    new Command("add-collection")
      .description("Add a target collection to the local app project")
      .argument("<collectionId>", "Collection id")
      .action(async (collectionId: CollectionId) => {
        await runAppCommand(async () => {
          const path = process.cwd();
          const manifest = readManifest(path);
          if (manifest.targetCollectionIds.includes(collectionId)) {
            throw new Error(`Collection ${collectionId} is already present.`);
          }
          const nextManifest = {
            ...manifest,
            targetCollectionIds: [
              ...manifest.targetCollectionIds,
              collectionId,
            ],
          };
          const backend = await createCliBackend();
          const targetCollections = await resolveLatestTargetCollections(
            backend,
            nextManifest.targetCollectionIds,
          );
          await writeManifest(path, nextManifest);
          await regenerateGeneratedFiles(path, targetCollections);
          return { targetCollectionIds: nextManifest.targetCollectionIds };
        });
      }),
    {
      outputShape: '{ "success": true, "data": { "targetCollectionIds": [] } }',
      sideEffects: [
        "Updates app.json.",
        "Regenerates Collection_*.ts and support files.",
      ],
      failureCases: [
        "Collection is already present.",
        "Collection does not exist.",
      ],
    },
  ),
);

apps.addCommand(
  useMarkdownHelp(
    new Command("remove-collection")
      .description("Remove a target collection from the local app project")
      .argument("<collectionId>", "Collection id")
      .action(async (collectionId: CollectionId) => {
        await runAppCommand(async () => {
          const path = process.cwd();
          const manifest = readManifest(path);
          if (!manifest.targetCollectionIds.includes(collectionId)) {
            throw new Error(`Collection ${collectionId} is not present.`);
          }
          const nextManifest = {
            ...manifest,
            targetCollectionIds: manifest.targetCollectionIds.filter(
              (targetCollectionId) => targetCollectionId !== collectionId,
            ),
          };
          const backend = await createCliBackend();
          const targetCollections = await resolveLatestTargetCollections(
            backend,
            nextManifest.targetCollectionIds,
          );
          await writeManifest(path, nextManifest);
          await regenerateGeneratedFiles(path, targetCollections);
          return { targetCollectionIds: nextManifest.targetCollectionIds };
        });
      }),
    {
      outputShape: '{ "success": true, "data": { "targetCollectionIds": [] } }',
      sideEffects: [
        "Updates app.json.",
        "Regenerates Collection_*.ts and support files.",
      ],
      failureCases: ["Collection is not present."],
    },
  ),
);

apps.addCommand(
  useMarkdownHelp(
    new Command("list").description("List backend apps").action(async () => {
      await runCommand(async () => (await createCliBackend()).apps.list());
    }),
    {
      outputShape:
        '{ "success": true, "data": [{ "id": "App_...", "latestVersion": {} }] }',
      sideEffects: ["None."],
    },
  ),
);

apps.addCommand(
  useMarkdownHelp(
    new Command("delete")
      .description("Delete a backend app")
      .argument("<appId>", "Backend app id")
      .action(async (appId: string) => {
        await runCommand(async () =>
          (await createCliBackend()).apps.delete(appId as any, "delete"),
        );
      }),
    {
      outputShape: '{ "success": true, "data": null }',
      sideEffects: ["Deletes the backend app."],
      failureCases: ["App does not exist."],
    },
  ),
);

function collect(value: string, previous: CollectionId[]): CollectionId[] {
  return [...previous, value as CollectionId];
}

async function runAppCommand<Data>(fn: () => Promise<Data>): Promise<void> {
  await runCommand(async () => {
    try {
      return successfulResult(await fn());
    } catch (error) {
      return unsuccessfulResult("CommandFailed", {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });
}

async function resolveLatestTargetCollections(
  backend: CliBackend,
  collectionIds: CollectionId[],
): Promise<TargetCollection[]> {
  const result = await backend.collections.list();
  if (!result.success) {
    throw new Error(JSON.stringify(result.error));
  }
  const collectionsById = new Map(
    result.data.map((collection) => [collection.id, collection]),
  );
  return collectionIds.map((collectionId) => {
    const collection = collectionsById.get(collectionId);
    if (!collection) {
      throw new Error(`Collection ${collectionId} not found.`);
    }
    return targetFromCollection(collection);
  });
}

async function resolveLockedTargetCollections(
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
      targetCollection.versionId as any,
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

async function getLockedApp(backend: CliBackend, appId: string) {
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

function targetFromCollection(collection: Collection): TargetCollection {
  return {
    id: collection.id,
    version: collection.latestVersion,
    displayName: collection.settings.name,
  };
}

function sameArray(left: readonly string[], right: readonly string[]): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

export default apps;
