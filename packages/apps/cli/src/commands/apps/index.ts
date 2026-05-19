import { Command } from "commander";
import { useMarkdownHelp } from "../shared/markdownHelp.js";
import addCollection from "./addCollection.js";
import check from "./check.js";
import checkout from "./checkout.js";
import commit from "./commit.js";
import deleteCommand from "./delete.js";
import init from "./init.js";
import list from "./list.js";
import removeCollection from "./removeCollection.js";
import status from "./status.js";

const apps = useMarkdownHelp(new Command("apps").description("Manage apps"), {
  relatedCommands: [
    "superego apps init --help",
    "superego apps checkout --help",
    "superego apps check --help",
    "superego apps commit --help",
  ],
});

apps
  .addCommand(init)
  .addCommand(checkout)
  .addCommand(check)
  .addCommand(status)
  .addCommand(commit)
  .addCommand(addCollection)
  .addCommand(removeCollection)
  .addCommand(list)
  .addCommand(deleteCommand);

export default apps;
