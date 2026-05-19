import type { AppId } from "@superego/backend";
import { Command } from "commander";
import { createCliBackend } from "../shared/backend.js";
import { useMarkdownHelp } from "../shared/markdownHelp.js";
import { runCommand } from "../shared/results.js";

const deleteCommand = useMarkdownHelp(
  new Command("delete")
    .description("Delete a backend app")
    .argument("<appId>", "Backend app id")
    .action(async (appId: AppId) => {
      await runCommand(async () =>
        (await createCliBackend()).apps.delete(appId, "delete"),
      );
    }),
  {
    outputShape: '{ "success": true, "data": null }',
    sideEffects: ["Deletes the backend app."],
    failureCases: ["App does not exist."],
  },
);

export default deleteCommand;
