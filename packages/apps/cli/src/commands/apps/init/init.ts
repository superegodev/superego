import { resolve } from "node:path";
import { AppType, type CollectionId } from "@superego/backend";
import { Command } from "commander";
import * as v from "valibot";
import createBackend from "../../../utils/createBackend.js";
import { useMarkdownHelp } from "../../../utils/markdownHelp.js";
import { readAppsArgs, requireArgsFile } from "../common/args.js";
import assertEmptyTarget from "../common/assertEmptyTarget.js";
import {
  resolveLatestTargetCollections,
  runAppCommand,
} from "../common/commandUtils.js";
import { getInitialMainSource } from "../common/mainSource.js";
import writeAppProject from "../common/writeAppProject.js";

const argsSchema = v.strictObject({
  path: v.string(),
  name: v.optional(v.string()),
  collection: v.optional(v.array(v.string())),
});

export default useMarkdownHelp(
  requireArgsFile(
    new Command("init").description("Create a new local app project."),
  ).action(async (options: { args: string }) => {
    await runAppCommand(async () => {
      const args = readAppsArgs(options.args, argsSchema);
      const path = args.path;
      const name = args.name ?? "Untitled App";
      const collection = args.collection ?? [];
      const projectPath = resolve(path);
      assertEmptyTarget(projectPath);
      const backend = await createBackend();
      const targetCollections = await resolveLatestTargetCollections(
        backend,
        collection as CollectionId[],
      );
      const manifest = {
        name,
        type: AppType.CollectionView,
        targetCollectionIds: collection as CollectionId[],
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
        targetCollectionIds: collection,
      };
    });
  }),
  { argsSchema },
);
