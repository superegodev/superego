import "./setupGlobals.js";
import { Command } from "commander";
import pkg from "../../package.json" with { type: "json" };
import devenv from "./commands/devenv/index.js";

const program = new Command();

program.name("superego").version(pkg.version).description(pkg.description);

program.addCommand(devenv);

program.parse();
