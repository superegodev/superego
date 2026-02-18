import { Command } from "commander";
import checkAction from "./check/index.js";
import createAction from "./create/index.js";
import generateTypesAction from "./generateTypes/index.js";
import packAction from "./pack/index.js";
import previewAction from "./preview/index.js";

const devenv = new Command("devenv").description(
  "Manage superego development environments",
);

devenv
  .command("create")
  .description("Create a new development environment")
  .argument("<path>", "Directory path for the new development environment")
  .action(createAction);

devenv
  .command("generate-types")
  .description("Generate TypeScript typings from collection schemas")
  .action(generateTypesAction);

devenv
  .command("check")
  .description(
    "Validate all collections and apps in the development environment",
  )
  .action(checkAction);

devenv
  .command("pack")
  .description("Compile the development environment into a pack.mpk file")
  .action(packAction);

devenv
  .command("preview")
  .description("Preview the development environment in the browser")
  .option("-w, --watch", "Watch for file changes and reload automatically")
  .action(previewAction);

export default devenv;
