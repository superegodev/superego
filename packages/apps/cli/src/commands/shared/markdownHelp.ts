import { Command } from "commander";

export interface HelpDetails {
  outputShape?: string;
  sideEffects?: string[];
  failureCases?: string[];
  relatedCommands?: string[];
  notes?: string[];
}

export function useMarkdownHelp(
  command: Command,
  details?: HelpDetails,
): Command {
  command.configureHelp({
    formatHelp: (cmd) => formatMarkdownHelp(cmd, details),
  });
  return command;
}

function formatMarkdownHelp(command: Command, details?: HelpDetails): string {
  const lines: string[] = [];
  const syntax = `${getCommandPath(command)} ${command.usage()}`.trim();
  lines.push(`# ${command.name()}`, "");
  lines.push("## Syntax", "", "```sh", syntax, "```", "");

  const description = command.description();
  if (description) {
    lines.push("## Description", "", `- ${description}`, "");
  }

  const argumentsHelp = command.registeredArguments.map((argument) => {
    const required = argument.required ? "required" : "optional";
    return `- \`${argument.name()}\` (${required}): ${argument.description}`;
  });
  if (argumentsHelp.length > 0) {
    lines.push("## Arguments", "", ...argumentsHelp, "");
  }

  const optionsHelp = command.options
    .filter((option) => !option.hidden)
    .map((option) => `- \`${option.flags}\`: ${option.description}`);
  if (optionsHelp.length > 0) {
    lines.push("## Options", "", ...optionsHelp, "");
  }

  const subcommands = command.commands.map(
    (subcommand) => `- \`${subcommand.name()}\`: ${subcommand.description()}`,
  );
  if (subcommands.length > 0) {
    lines.push("## Commands", "", ...subcommands, "");
  }

  if (details?.outputShape) {
    lines.push("## JSON Output", "", "```json", details.outputShape, "```", "");
  }
  addList(lines, "Side Effects", details?.sideEffects);
  addList(lines, "Common Failure Cases", details?.failureCases);
  addList(lines, "Related Commands", details?.relatedCommands);
  addList(lines, "Notes", details?.notes);

  return `${lines.join("\n").trimEnd()}\n`;
}

function getCommandPath(command: Command): string {
  const names: string[] = [];
  for (
    let currentCommand: Command | null = command;
    currentCommand;
    currentCommand = currentCommand.parent
  ) {
    names.unshift(currentCommand.name());
  }
  return names.join(" ");
}

function addList(lines: string[], title: string, items?: string[]): void {
  if (!items || items.length === 0) {
    return;
  }
  lines.push(`## ${title}`, "", ...items.map((item) => `- ${item}`), "");
}
