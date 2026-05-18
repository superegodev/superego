import { Command } from "commander";
import { useMarkdownHelp } from "../shared/markdownHelp.js";
import installSkill from "./installSkill/index.js";

const agents = useMarkdownHelp(
  new Command("agents").description("Install coding-agent integrations"),
  {
    relatedCommands: ["superego agents install-skill --help"],
  },
);

agents.addCommand(installSkill);

export default agents;
