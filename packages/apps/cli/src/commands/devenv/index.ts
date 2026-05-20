import { Command } from "commander";
import { useMarkdownHelp } from "../../utils/markdownHelp.js";
import check from "./check/check.js";
import create from "./create/create.js";
import generateTypes from "./generate-types/generate-types.js";
import pack from "./pack/pack.js";
import preview from "./preview/preview.js";

export default useMarkdownHelp(
  new Command("devenv")
    .description("Manage superego development environments")
    .addCommand(create)
    .addCommand(generateTypes)
    .addCommand(check)
    .addCommand(pack)
    .addCommand(preview),
);
