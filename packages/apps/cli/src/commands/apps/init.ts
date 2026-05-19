import { resolve } from "node:path";
import { AppType, type CollectionId } from "@superego/backend";
import { Command } from "commander";
import { createCliBackend } from "../shared/backend.js";
import { useMarkdownHelp } from "../shared/markdownHelp.js";
import {
  assertEmptyTarget,
  getInitialMainSource,
  writeAppProject,
} from "./appProject.js";
import {
  collect,
  resolveLatestTargetCollections,
  runAppCommand,
} from "./shared.js";

const init = useMarkdownHelp(
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
);

export default init;
