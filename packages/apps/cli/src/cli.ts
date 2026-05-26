import { Command } from "commander";
import additionalNotes from "./additional-notes.md?raw";
import agents from "./commands/agents/index.js";
import apps from "./commands/apps/index.js";
import collectionCategories from "./commands/collection-categories/index.js";
import collections from "./commands/collections/index.js";
import documents from "./commands/documents/index.js";
import files from "./commands/files/index.js";
import { useMarkdownHelp } from "./utils/markdownHelp.js";

export default function cli(options: {
  version: string;
  argv?: readonly string[];
}): Promise<void> {
  const program = new Command()
    .name("superego")
    .version(options.version, "-V, --version", "Output the version number.")
    .description(
      "Superego is a local-first personal database. Data is stored as documents inside typed collections; apps extend how the data is viewed and edited.",
    )
    .addCommand(collectionCategories)
    .addCommand(collections)
    .addCommand(documents)
    .addCommand(files)
    .addCommand(agents)
    .addCommand(apps);
  useMarkdownHelp(program, { additionalNotes });
  return program.parseAsync(options.argv).then(() => undefined);
}
