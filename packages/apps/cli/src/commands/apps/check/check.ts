import { Command } from "commander";
import createBackend from "../../../utils/createBackend.js";
import { useMarkdownHelp } from "../../../utils/markdownHelp.js";
import {
  resolveLatestTargetCollections,
  runAppCommand,
} from "../common/commandUtils.js";
import { compileApp } from "../common/compile.js";
import { readLock } from "../common/lock.js";
import { readMainSource } from "../common/mainSource.js";
import { readManifest } from "../common/manifest.js";

export default useMarkdownHelp(
  new Command("check")
    .description("Validate and compile the local app project")
    .action(async () => {
      await runAppCommand(async () => {
        const path = process.cwd();
        const manifest = readManifest(path);
        readLock(path);
        readMainSource(path);
        const backend = await createBackend();
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
