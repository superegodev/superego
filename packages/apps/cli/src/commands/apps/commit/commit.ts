import { Command } from "commander";
import { createCliBackend } from "../../../utils/backend.js";
import { useMarkdownHelp } from "../../../utils/markdownHelp.js";
import {
  getLockedApp,
  resolveLatestTargetCollections,
  runAppCommand,
  sameArray,
} from "../common/commandUtils.js";
import {
  buildLock,
  compileApp,
  readLock,
  readMainSource,
  readManifest,
  writeLock,
} from "../common/index.js";

export default useMarkdownHelp(
  new Command("commit")
    .description("Create or update the backend app from the local project")
    .action(async () => {
      await runAppCommand(async () => {
        const path = process.cwd();
        const manifest = readManifest(path);
        const lock = readLock(path);
        const backend = await createCliBackend();
        const operations: string[] = [];

        if (!lock) {
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
          operations.push("created app");
          return { operations, appId: result.data.id };
        }

        let app = await getLockedApp(backend, lock.appId);
        if (lock.latestAppVersionId !== app.latestVersion.id) {
          throw new Error(
            "Checkout is stale. Run apps status and checkout again.",
          );
        }
        const targetCollectionIds = app.latestVersion.targetCollections.map(
          (targetCollection) => targetCollection.id,
        );
        const source = readMainSource(path);
        const sourceChanged =
          source !== app.latestVersion.files["/main.tsx"].source;
        const targetCollectionsChanged = !sameArray(
          manifest.targetCollectionIds,
          targetCollectionIds,
        );
        const mainModule =
          sourceChanged || targetCollectionsChanged
            ? await compileApp(
                path,
                await resolveLatestTargetCollections(
                  backend,
                  manifest.targetCollectionIds,
                ),
              )
            : null;

        if (manifest.name !== app.name) {
          const result = await backend.apps.updateName(app.id, manifest.name);
          if (!result.success) {
            throw new Error(JSON.stringify(result.error));
          }
          app = result.data;
          operations.push("updated name");
        }

        if (sourceChanged || targetCollectionsChanged) {
          const result = await backend.apps.createNewVersion(
            app.id,
            manifest.targetCollectionIds,
            { "/main.tsx": mainModule! },
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
);
