import { Command } from "commander";
import { useMarkdownHelp } from "../../utils/markdownHelp.js";
import create from "./create/create.js";
import deleteCommand from "./delete/delete.js";
import list from "./list/list.js";
import update from "./update/update.js";

export default useMarkdownHelp(
  new Command("collection-categories")
    .description("Group collections for navigation")
    .addCommand(create)
    .addCommand(update)
    .addCommand(deleteCommand)
    .addCommand(list),
);
