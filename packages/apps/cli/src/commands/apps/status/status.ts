import { Command } from "commander";
import { createCliBackend } from "../../../utils/backend.js";
import { useMarkdownHelp } from "../../../utils/markdownHelp.js";
import {
  getLockedApp,
  runAppCommand,
  sameArray,
} from "../common/commandUtils.js";
import { readLock, readMainSource, readManifest } from "../common/index.js";

export default useMarkdownHelp(
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
);
