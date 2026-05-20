import { Command } from "commander";
import { useMarkdownHelp } from "../../utils/markdownHelp.js";
import installSkill from "./install-skill/install-skill.js";

export default useMarkdownHelp(
  new Command("agents")
    .description("Install coding-agent integrations")
    .addCommand(installSkill),
);
