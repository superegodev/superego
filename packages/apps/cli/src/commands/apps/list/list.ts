import { Command } from "commander";
import { createCliBackend } from "../../../utils/backend.js";
import { useMarkdownHelp } from "../../../utils/markdownHelp.js";
import { runCommand } from "../../../utils/results.js";

export default useMarkdownHelp(
  new Command("list").description("List backend apps").action(async () => {
    await runCommand(async () => (await createCliBackend()).apps.list());
  }),
);
