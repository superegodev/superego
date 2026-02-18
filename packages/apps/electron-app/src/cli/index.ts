import "./setupGlobals.js";
import { Command } from "commander";
import pkg from "../../package.json" with { type: "json" };
import devenv from "./commands/devenv/index.js";

new Command()
  .name("superego")
  .version(pkg.version)
  .description(pkg.description)
  .addCommand(devenv)
  .parse();
