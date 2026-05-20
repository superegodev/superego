import { Command } from "commander";
import { useMarkdownHelp } from "../../utils/markdownHelp.js";
import getContent from "./get-content/get-content.js";

export default useMarkdownHelp(
  new Command("files").description("Manage files").addCommand(getContent),
);
