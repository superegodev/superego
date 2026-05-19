import { Command } from "commander";
import { createCliBackend } from "../shared/backend.js";
import { useMarkdownHelp } from "../shared/markdownHelp.js";
import {
  compileApp,
  readLock,
  readMainSource,
  readManifest,
} from "./appProject.js";
import { resolveLatestTargetCollections, runAppCommand } from "./shared.js";

const check = useMarkdownHelp(
  new Command("check")
    .description("Validate and compile the local app project")
    .action(async () => {
      await runAppCommand(async () => {
        const path = process.cwd();
        const manifest = readManifest(path);
        readLock(path);
        readMainSource(path);
        const backend = await createCliBackend();
        const targetCollections = await resolveLatestTargetCollections(
          backend,
          manifest.targetCollectionIds,
        );
        await compileApp(path, targetCollections);
        return {
          path,
          targetCollectionIds: manifest.targetCollectionIds,
          compiled: true,
        };
      });
    }),
  {
    outputShape: '{ "success": true, "data": { "compiled": true } }',
    sideEffects: ["None."],
    failureCases: [
      "app.json is missing or invalid.",
      "app.lock.json is invalid.",
      "main.tsx is missing.",
      "A target collection is missing.",
      "TypeScript compilation fails.",
    ],
  },
);

export default check;
