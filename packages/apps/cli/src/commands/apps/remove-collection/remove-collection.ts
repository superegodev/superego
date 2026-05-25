import type { CollectionId } from "@superego/backend";
import { Command } from "commander";
import createBackend from "../../../utils/createBackend.js";
import { useMarkdownHelp } from "../../../utils/markdownHelp.js";
import {
  getRequiredStringArg,
  readAppsArgs,
  requireArgsFile,
} from "../common/args.js";
import {
  resolveLatestTargetCollections,
  runAppCommand,
} from "../common/commandUtils.js";
import { regenerateGeneratedFiles } from "../common/generatedFiles.js";
import { readManifest, writeManifest } from "../common/manifest.js";

export default useMarkdownHelp(
  requireArgsFile(
    new Command("remove-collection").description(
      "Remove a target collection from the local app project.",
    ),
  ).action(async (options: { args: string }) => {
    await runAppCommand(async () => {
      const args = readAppsArgs(options.args, ["collectionId"]);
      const collectionId = getRequiredStringArg(
        args,
        "collectionId",
      ) as CollectionId;
      const path = process.cwd();
      const manifest = readManifest(path);
      if (!manifest.targetCollectionIds.includes(collectionId)) {
        throw new Error(`Collection ${collectionId} is not present.`);
      }
      const nextManifest = {
        ...manifest,
        targetCollectionIds: manifest.targetCollectionIds.filter(
          (targetCollectionId) => targetCollectionId !== collectionId,
        ),
      };
      const backend = await createBackend();
      const targetCollections = await resolveLatestTargetCollections(
        backend,
        nextManifest.targetCollectionIds,
      );
      await writeManifest(path, nextManifest);
      await regenerateGeneratedFiles(path, targetCollections);
      return { targetCollectionIds: nextManifest.targetCollectionIds };
    });
  }),
);
