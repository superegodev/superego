import { resolve } from "node:path";
import { Command } from "commander";
import createBackend from "../../../utils/createBackend.js";
import { useMarkdownHelp } from "../../../utils/markdownHelp.js";
import {
  getRequiredStringArg,
  readAppsArgs,
  requireArgsFile,
} from "../common/args.js";
import assertEmptyTarget from "../common/assertEmptyTarget.js";
import {
  resolveLockedTargetCollections,
  runAppCommand,
} from "../common/commandUtils.js";
import { buildLock } from "../common/lock.js";
import writeAppProject from "../common/writeAppProject.js";

export default useMarkdownHelp(
  requireArgsFile(
    new Command("checkout").description(
      "Check out an existing backend app into a local folder.",
    ),
    {
      type: "object",
      additionalProperties: false,
      properties: {
        path: { type: "string" },
        appId: { type: "string" },
      },
      required: ["path", "appId"],
    },
  ).action(async (options: { args: string }) => {
    await runAppCommand(async () => {
      const args = readAppsArgs(options.args, ["path", "appId"]);
      const path = getRequiredStringArg(args, "path");
      const appId = getRequiredStringArg(args, "appId");
      const projectPath = resolve(path);
      assertEmptyTarget(projectPath);
      const backend = await createBackend();
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
);
