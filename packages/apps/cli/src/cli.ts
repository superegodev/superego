import { Command } from "commander";
import agents from "./commands/agents/index.js";
import apps from "./commands/apps/index.js";
import devenv from "./commands/devenv/index.js";
import {
  collectionCategories,
  collections,
  documents,
  files,
} from "./commands/proxy/index.js";
import { useMarkdownHelp } from "./commands/shared/markdownHelp.js";

export default function cli(options: {
  version: string;
  description: string;
}): void {
  const program = useMarkdownHelp(
    new Command()
      .name("superego")
      .version(options.version)
      .description(options.description)
      .addCommand(collectionCategories)
      .addCommand(collections)
      .addCommand(documents)
      .addCommand(files)
      .addCommand(agents)
      .addCommand(apps)
      .addCommand(devenv),
    {
      outputShape: "Commands print JSON unless invoked with --help.",
      relatedCommands: [
        "superego collection-categories --help",
        "superego collections --help",
        "superego documents --help",
        "superego files --help",
        "superego agents --help",
        "superego apps --help",
      ],
    },
  );
  program.parse();
}
