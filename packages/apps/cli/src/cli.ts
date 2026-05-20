import { Command } from "commander";
import agents from "./commands/agents/index.js";
import apps from "./commands/apps/index.js";
import collectionCategories from "./commands/collection-categories/index.js";
import collections from "./commands/collections/index.js";
import devenv from "./commands/devenv/index.js";
import documents from "./commands/documents/index.js";
import files from "./commands/files/index.js";
import rootHelp from "./help.md?raw";
import { setMarkdownHelp, useMarkdownHelp } from "./utils/markdownHelp.js";

export default function cli(options: {
  version: string;
  description: string;
}): void {
  const program = new Command()
    .name("superego")
    .version(options.version)
    .description(options.description)
    .addCommand(collectionCategories)
    .addCommand(collections)
    .addCommand(documents)
    .addCommand(files)
    .addCommand(agents)
    .addCommand(apps)
    .addCommand(devenv);
  setMarkdownHelp(program, rootHelp);
  useMarkdownHelp(program);
  program.parse();
}
