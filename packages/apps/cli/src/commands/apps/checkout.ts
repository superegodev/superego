import { resolve } from "node:path";
import { Command } from "commander";
import { createCliBackend } from "../shared/backend.js";
import { useMarkdownHelp } from "../shared/markdownHelp.js";
import { assertEmptyTarget, buildLock, writeAppProject } from "./appProject.js";
import { resolveLockedTargetCollections, runAppCommand } from "./shared.js";

const checkout = useMarkdownHelp(
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
        const app = appsResult.data.find((candidate) => candidate.id === appId);
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
);

export default checkout;
