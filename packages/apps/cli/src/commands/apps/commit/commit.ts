import { Command } from "commander";
import createBackend from "../../../utils/createBackend.js";
import { useMarkdownHelp } from "../../../utils/markdownHelp.js";
import { runAppCommand } from "../common/commandUtils.js";
import { readLock } from "../common/lock.js";
import { readManifest } from "../common/manifest.js";
import createApp from "./createApp.js";
import updateApp from "./updateApp.js";

export default function commit(): Command {
  return useMarkdownHelp(
    new Command("commit")
      .description("Create or update the backend app from the local project")
      .action(async () => {
        await runAppCommand(async () => {
          const path = process.cwd();
          const manifest = readManifest(path);
          const lock = readLock(path);
          const backend = await createBackend();

          if (!lock) {
            return createApp({ backend, path, manifest });
          }
          return updateApp({ backend, path, manifest, lock });
        });
      }),
  );
}
