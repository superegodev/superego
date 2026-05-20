import { Command } from "commander";
import { useMarkdownHelp } from "../../utils/markdownHelp.js";
import addCollection from "./add-collection/add-collection.js";
import check from "./check/check.js";
import checkout from "./checkout/checkout.js";
import commit from "./commit/commit.js";
import deleteCommand from "./delete/delete.js";
import init from "./init/init.js";
import list from "./list/list.js";
import removeCollection from "./remove-collection/remove-collection.js";
import status from "./status/status.js";

export default useMarkdownHelp(
  new Command("apps")
    .description("Manage apps")
    .addCommand(init)
    .addCommand(checkout)
    .addCommand(check)
    .addCommand(status)
    .addCommand(commit)
    .addCommand(addCollection)
    .addCommand(removeCollection)
    .addCommand(list)
    .addCommand(deleteCommand),
);
