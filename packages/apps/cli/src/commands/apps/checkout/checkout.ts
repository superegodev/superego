import { resolve } from "node:path";
import { Command } from "commander";
import createBackend from "../../../utils/createBackend.js";
import { useMarkdownHelp } from "../../../utils/markdownHelp.js";
import assertEmptyTarget from "../common/assertEmptyTarget.js";
import {
  resolveLockedTargetCollections,
  runAppCommand,
} from "../common/commandUtils.js";
import { buildLock } from "../common/lock.js";
import writeAppProject from "../common/writeAppProject.js";

export default useMarkdownHelp(
  new Command("checkout")
    .description("Check out an existing backend app into a local folder.")
    .requiredOption("--path <path>", "New project path.")
    .requiredOption("--app-id <appId>", "Backend app id.")
    .action(async (options: { path: string; appId: string }) => {
      await runAppCommand(async () => {
        const projectPath = resolve(options.path);
        assertEmptyTarget(projectPath);
        const backend = await createBackend();
        const appsResult = await backend.apps.list();
        if (!appsResult.success) {
          throw new Error(JSON.stringify(appsResult.error));
        }
        const app = appsResult.data.find(
          (candidate) => candidate.id === options.appId,
        );
        if (!app) {
          throw new Error(`App ${options.appId} not found.`);
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
);
