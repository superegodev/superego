import { Command } from "commander";
import { createCliBackend } from "../shared/backend.js";
import { useMarkdownHelp } from "../shared/markdownHelp.js";
import { runCommand } from "../shared/results.js";

const list = useMarkdownHelp(
  new Command("list").description("List backend apps").action(async () => {
    await runCommand(async () => (await createCliBackend()).apps.list());
  }),
  {
    outputShape:
      '{ "success": true, "data": [{ "id": "App_...", "latestVersion": {} }] }',
    sideEffects: ["None."],
  },
);

export default list;
