import { resolve } from "node:path";
import { AppType, type CollectionId } from "@superego/backend";
import { Command } from "commander";
import createBackend from "../../../utils/createBackend.js";
import { useMarkdownHelp } from "../../../utils/markdownHelp.js";
import assertEmptyTarget from "../common/assertEmptyTarget.js";
import {
  collect,
  resolveLatestTargetCollections,
  runAppCommand,
} from "../common/commandUtils.js";
import { getInitialMainSource } from "../common/mainSource.js";
import writeAppProject from "../common/writeAppProject.js";

export default useMarkdownHelp(
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
          const backend = await createBackend();
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
);
