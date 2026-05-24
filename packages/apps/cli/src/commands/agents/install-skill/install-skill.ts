import { mkdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { Command } from "commander";
import { useMarkdownHelp } from "../../../utils/markdownHelp.js";
import { runCommand, successfulResult } from "../../../utils/results.js";
import skillContent from "./SKILL.md?raw";

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
    .description("Install the Superego CLI skill for a coding agent.")
    .option("--agent <agent>", "Known agent name.")
    .option("--directory <directory>", "Explicit skills directory.")
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
