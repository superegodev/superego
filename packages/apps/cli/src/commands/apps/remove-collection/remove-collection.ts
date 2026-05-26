import type { CollectionId } from "@superego/backend";
import { Command } from "commander";
import * as v from "valibot";
import createBackend from "../../../utils/createBackend.js";
import { useMarkdownHelp } from "../../../utils/markdownHelp.js";
import { readAppsArgs, requireArgsFile } from "../common/args.js";
import {
  resolveLatestTargetCollections,
  runAppCommand,
} from "../common/commandUtils.js";
import { regenerateGeneratedFiles } from "../common/generatedFiles.js";
import { readManifest, writeManifest } from "../common/manifest.js";

const argsSchema = v.strictObject({
  collectionId: v.string(),
});

export default useMarkdownHelp(
  requireArgsFile(
    new Command("remove-collection").description(
      "Remove a target collection from the local app project.",
    ),
  ).action(async (options: { args: string }) => {
    await runAppCommand(async () => {
      const args = readAppsArgs(options.args, argsSchema);
      const collectionId = args.collectionId as CollectionId;
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
  { argsSchema },
);
