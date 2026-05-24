import type { CollectionId } from "@superego/backend";
import { Command } from "commander";
import createBackend from "../../../utils/createBackend.js";
import { useMarkdownHelp } from "../../../utils/markdownHelp.js";
import {
  resolveLatestTargetCollections,
  runAppCommand,
} from "../common/commandUtils.js";
import { regenerateGeneratedFiles } from "../common/generatedFiles.js";
import { readManifest, writeManifest } from "../common/manifest.js";

export default useMarkdownHelp(
  new Command("remove-collection")
    .description("Remove a target collection from the local app project.")
    .requiredOption("--collection-id <collectionId>", "Collection id.")
    .action(async (options: { collectionId: CollectionId }) => {
      await runAppCommand(async () => {
        const path = process.cwd();
        const manifest = readManifest(path);
        if (!manifest.targetCollectionIds.includes(options.collectionId)) {
          throw new Error(`Collection ${options.collectionId} is not present.`);
        }
        const nextManifest = {
          ...manifest,
          targetCollectionIds: manifest.targetCollectionIds.filter(
            (targetCollectionId) => targetCollectionId !== options.collectionId,
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
