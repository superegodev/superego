import { Command } from "commander";
import { createCliBackend } from "../../../utils/backend.js";
import { useMarkdownHelp } from "../../../utils/markdownHelp.js";
import {
  resolveLatestTargetCollections,
  runAppCommand,
} from "../common/commandUtils.js";
import {
  compileApp,
  readLock,
  readMainSource,
  readManifest,
} from "../common/index.js";

export default useMarkdownHelp(
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
);
