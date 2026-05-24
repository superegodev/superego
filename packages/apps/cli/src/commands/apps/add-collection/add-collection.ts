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
  new Command("add-collection")
    .description("Add a target collection to the local app project")
    .argument("<collectionId>", "Collection id")
    .action(async (collectionId: CollectionId) => {
      await runAppCommand(async () => {
        const path = process.cwd();
        const manifest = readManifest(path);
        if (manifest.targetCollectionIds.includes(collectionId)) {
          throw new Error(`Collection ${collectionId} is already present.`);
        }
        const nextManifest = {
          ...manifest,
          targetCollectionIds: [...manifest.targetCollectionIds, collectionId],
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
