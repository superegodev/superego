import { Command } from "commander";

interface JsonOptionHelp {
  name: string;
  schema: unknown;
}

const jsonOptionsHelpByCommand = new WeakMap<Command, JsonOptionHelp[]>();
const markdownHelpByCommand = new WeakMap<Command, string>();

export function setJsonOptionsHelp(
  command: Command,
  jsonOptionsHelp: JsonOptionHelp[],
): void {
  jsonOptionsHelpByCommand.set(command, jsonOptionsHelp);
}

export function setMarkdownHelp(command: Command, markdownHelp: string): void {
  markdownHelpByCommand.set(command, markdownHelp);
}

export function useMarkdownHelp(command: Command): Command {
  command.configureHelp({
    formatHelp: formatMarkdownHelp,
  });
  return command;
}

function formatMarkdownHelp(command: Command): string {
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

  const jsonOptionsHelp = jsonOptionsHelpByCommand.get(command);
  if (jsonOptionsHelp && jsonOptionsHelp.length > 0) {
    lines.push("## JSON Options", "");
    for (const optionHelp of jsonOptionsHelp) {
      lines.push(
        `### --${optionHelp.name}`,
        "",
        "```json",
        JSON.stringify(optionHelp.schema, null, 2),
        "```",
        "",
      );
    }
  }

  const markdownHelp = markdownHelpByCommand.get(command);
  if (markdownHelp) {
    lines.push(markdownHelp.trim(), "");
  }

  const subcommands = command.commands.map(
    (subcommand) => `- \`${subcommand.name()}\`: ${subcommand.description()}`,
  );
  if (subcommands.length > 0) {
    lines.push("## Commands", "", ...subcommands, "");
  }

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
