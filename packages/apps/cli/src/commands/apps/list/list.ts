import { Command } from "commander";
import createBackend from "../../../utils/createBackend.js";
import { useMarkdownHelp } from "../../../utils/markdownHelp.js";
import { runCommand } from "../../../utils/results.js";

export default useMarkdownHelp(
  new Command("list").description("List backend apps.").action(async () => {
    await runCommand(async () => (await createBackend()).apps.list());
  }),
);
