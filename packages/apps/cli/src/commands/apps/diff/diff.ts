import { Command } from "commander";
import createBackend from "../../../utils/createBackend.js";
import { useMarkdownHelp } from "../../../utils/markdownHelp.js";
import { getLockedApp, runAppCommand } from "../common/commandUtils.js";
import { readLock } from "../common/lock.js";
import { readMainSource } from "../common/mainSource.js";
import { readManifest } from "../common/manifest.js";
import getStatus from "./getStatus.js";
import makeArrayFieldDiff from "./makeArrayFieldDiff.js";
import makeFieldDiff from "./makeFieldDiff.js";
import makeUnifiedDiff from "./makeUnifiedDiff.js";

export default useMarkdownHelp(
  new Command("diff")
    .description("Show local app project changes compared with the database.")
    .action(async () => {
      await runAppCommand(async () => {
        const path = process.cwd();
        const manifest = readManifest(path);
        const lock = readLock(path);
        const source = readMainSource(path);
        if (!lock) {
          throw new Error("app.lock.json is missing. This app is new.");
        }

        const backend = await createBackend();
        const app = await getLockedApp(backend, lock.appId);
        const remoteManifest = {
          name: app.name,
          type: app.type,
          targetCollectionIds: app.latestVersion.targetCollections.map(
            (targetCollection) => targetCollection.id,
          ),
        };
        const remoteSource = app.latestVersion.files["/main.tsx"];
        const name = makeFieldDiff(manifest.name, remoteManifest.name);
        const type = makeFieldDiff(manifest.type, remoteManifest.type);
        const targetCollectionIds = makeArrayFieldDiff(
          manifest.targetCollectionIds,
          remoteManifest.targetCollectionIds,
        );
        const sourceChanged = source !== remoteSource;
        const stale = lock.latestAppVersionId !== app.latestVersion.id;
        const status = getStatus({
          metadataChanged:
            name.changed || type.changed || targetCollectionIds.changed,
          sourceChanged,
          stale,
        });

        return {
          status,
          appId: lock.appId,
          lockedLatestAppVersionId: lock.latestAppVersionId,
          databaseLatestAppVersionId: app.latestVersion.id,
          stale,
          manifest: {
            name,
            type,
            targetCollectionIds,
          },
          source: {
            changed: sourceChanged,
            diff: sourceChanged
              ? makeUnifiedDiff(
                  "remote/main.tsx",
                  remoteSource,
                  "local/main.tsx",
                  source,
                )
              : null,
          },
        };
      });
    }),
);
