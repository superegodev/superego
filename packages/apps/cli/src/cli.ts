import { Command } from "commander";
import devenv from "./commands/devenv/index.js";

export default function cli(options: {
  version: string;
  description: string;
}): void {
  new Command()
    .name("superego")
    .version(options.version)
    .description(options.description)
    .addCommand(devenv)
    .parse();
}
