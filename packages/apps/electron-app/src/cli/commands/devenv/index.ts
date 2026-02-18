import { Command } from "commander";
import checkAction from "./check/index.js";
import createAction from "./create/index.js";
import generateTypesAction from "./generateTypes/index.js";
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
  .command("preview")
  .description("Preview the development environment in the browser")
  .action(previewAction);

export default devenv;
