import type { AppId } from "@superego/backend";
import { Command } from "commander";
import createBackend from "../../../utils/createBackend.js";
import { useMarkdownHelp } from "../../../utils/markdownHelp.js";
import { runCommand } from "../../../utils/results.js";

export default useMarkdownHelp(
  new Command("delete")
    .description("Delete a backend app")
    .argument("<appId>", "Backend app id")
    .action(async (appId: AppId) => {
      await runCommand(async () =>
        (await createBackend()).apps.delete(appId, "delete"),
      );
    }),
);
