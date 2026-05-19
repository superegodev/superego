import type { CollectionId } from "@superego/backend";
import { Command } from "commander";
import { createCliBackend } from "../shared/backend.js";
import { useMarkdownHelp } from "../shared/markdownHelp.js";
import {
  readManifest,
  regenerateGeneratedFiles,
  writeManifest,
} from "./appProject.js";
import { resolveLatestTargetCollections, runAppCommand } from "./shared.js";

const removeCollection = useMarkdownHelp(
  new Command("remove-collection")
    .description("Remove a target collection from the local app project")
    .argument("<collectionId>", "Collection id")
    .action(async (collectionId: CollectionId) => {
      await runAppCommand(async () => {
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
        const backend = await createCliBackend();
        const targetCollections = await resolveLatestTargetCollections(
          backend,
          nextManifest.targetCollectionIds,
        );
        await writeManifest(path, nextManifest);
        await regenerateGeneratedFiles(path, targetCollections);
        return { targetCollectionIds: nextManifest.targetCollectionIds };
      });
    }),
  {
    outputShape: '{ "success": true, "data": { "targetCollectionIds": [] } }',
    sideEffects: [
      "Updates app.json.",
      "Regenerates Collection_*.ts and support files.",
    ],
    failureCases: ["Collection is not present."],
  },
);

export default removeCollection;
