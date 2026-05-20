import { mkdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { Command } from "commander";
import { useMarkdownHelp } from "../../../utils/markdownHelp.js";
import { runCommand, successfulResult } from "../../../utils/results.js";

const agentDirectories = {
  claude: ".claude/skills",
  codex: ".codex/skills",
  copilot: ".copilot/skills",
  cursor: ".cursor/skills",
  gemini: ".gemini/skills",
  windsurf: ".codeium/windsurf/skills",
  kiro: ".kiro/skills",
  opencode: ".config/opencode/skills",
} as const;

type Agent = keyof typeof agentDirectories;

export default useMarkdownHelp(
  new Command("install-skill")
    .description("Install the Superego CLI skill for a coding agent")
    .option("--agent <agent>", "Known agent name")
    .option("--directory <directory>", "Explicit skills directory")
    .action(async (options: { agent?: string; directory?: string }) => {
      await runCommand(async () => {
        const skillsDirectory = getSkillsDirectory(options);
        const skillDirectory = join(skillsDirectory, "superego-cli");
        await mkdir(skillDirectory, { recursive: true });
        await writeFile(
          join(skillDirectory, "SKILL.md"),
          skillContent,
          "utf-8",
        );
        return successfulResult({
          directory: skillDirectory,
          file: join(skillDirectory, "SKILL.md"),
        });
      });
    }),
);

function getSkillsDirectory(options: {
  agent?: string;
  directory?: string;
}): string {
  if (
    (options.agent && options.directory) ||
    (!options.agent && !options.directory)
  ) {
    throw new Error("Exactly one of --agent or --directory is required.");
  }
  if (options.directory) {
    return resolve(options.directory);
  }
  const agent = options.agent as Agent;
  const directory = agentDirectories[agent];
  if (!directory) {
    throw new Error(
      `Unknown agent "${options.agent}". Expected one of ${Object.keys(agentDirectories).join(", ")}.`,
    );
  }
  return join(homedir(), directory);
}

const skillContent = `# Superego CLI

Use \`superego\` to inspect and mutate the local Superego database.

Rules:

- Commands output JSON unless invoked with \`--help\`.
- Backend object commands output backend \`Result\` JSON.
- Local workflow commands output \`{ "success": true, "data": ... }\` or \`{ "success": false, "error": ... }\`.
- Run \`superego <domain> <command> --help\` before using an unfamiliar command.
- Prefer CLI commands over direct database edits.

Command map:

- \`collection-categories\`: \`create\`, \`update\`, \`delete\`, \`list\`
- \`collections\`: \`create\`, \`create-many\`, \`update-settings\`, \`create-new-version\`, \`update-latest-version-settings\`, \`delete\`, \`list\`, \`get-typescript-schema\`
- \`documents\`: \`create\`, \`create-many\`, \`create-new-version\`, \`delete\`, \`list\`, \`list-versions\`, \`get\`, \`get-version\`, \`search\`, \`execute-typescript-function\`
- \`files\`: \`get-content\`
- \`agents\`: \`install-skill\`
- \`apps\`: \`init\`, \`checkout\`, \`check\`, \`status\`, \`commit\`, \`add-collection\`, \`remove-collection\`, \`delete\`, \`list\`
- \`devenv\`: \`create\`, \`generate-types\`, \`check\`, \`pack\`, \`preview\`

Common workflows:

- Inspect command docs: \`superego <domain> <command> --help\`
- Create/list/update backend objects with named JSON options.
- Create an app project: \`superego apps init ./my-app --collection Collection_...\`
- Validate an app project: \`superego apps check\`
- Commit an app project: \`superego apps commit\`
- Create a development environment: \`superego devenv create ./my-pack\`
`;
