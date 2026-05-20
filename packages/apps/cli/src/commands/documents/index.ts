import { Command } from "commander";
import { useMarkdownHelp } from "../../utils/markdownHelp.js";
import createMany from "./create-many/create-many.js";
import createNewVersion from "./create-new-version/create-new-version.js";
import create from "./create/create.js";
import deleteCommand from "./delete/delete.js";
import executeTypescriptFunction from "./execute-typescript-function/execute-typescript-function.js";
import getVersion from "./get-version/get-version.js";
import get from "./get/get.js";
import listVersions from "./list-versions/list-versions.js";
import list from "./list/list.js";
import search from "./search/search.js";

export default useMarkdownHelp(
  new Command("documents")
    .description("Manage documents")
    .addCommand(create)
    .addCommand(createMany)
    .addCommand(createNewVersion)
    .addCommand(deleteCommand)
    .addCommand(list)
    .addCommand(listVersions)
    .addCommand(get)
    .addCommand(getVersion)
    .addCommand(search)
    .addCommand(executeTypescriptFunction),
);
