import { resolve } from "node:path";
import { AppType, type CollectionId } from "@superego/backend";
import { Command } from "commander";
import createBackend from "../../../utils/createBackend.js";
import { useMarkdownHelp } from "../../../utils/markdownHelp.js";
import {
  getOptionalStringArg,
  getOptionalStringArrayArg,
  getRequiredStringArg,
  readAppsArgs,
  requireArgsFile,
} from "../common/args.js";
import assertEmptyTarget from "../common/assertEmptyTarget.js";
import {
  resolveLatestTargetCollections,
  runAppCommand,
} from "../common/commandUtils.js";
import { getInitialMainSource } from "../common/mainSource.js";
import writeAppProject from "../common/writeAppProject.js";

export default useMarkdownHelp(
  requireArgsFile(
    new Command("init").description("Create a new local app project."),
    {
      type: "object",
      additionalProperties: false,
      properties: {
        path: { type: "string" },
        name: { type: "string" },
        collection: { type: "array", items: { type: "string" } },
      },
      required: ["path"],
    },
  ).action(async (options: { args: string }) => {
    await runAppCommand(async () => {
      const args = readAppsArgs(options.args, ["path", "name", "collection"]);
      const path = getRequiredStringArg(args, "path");
      const name = getOptionalStringArg(args, "name", "Untitled App");
      const collection = getOptionalStringArrayArg(args, "collection", []);
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
);
