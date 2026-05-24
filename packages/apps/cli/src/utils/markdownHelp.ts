import { Command } from "commander";

interface JsonOptionHelp {
  name: string;
  schema: unknown;
}

const jsonOptionsHelpByCommand = new WeakMap<Command, JsonOptionHelp[]>();
const additionalNotesByCommand = new WeakMap<Command, string>();

export function setJsonOptionsHelp(
  command: Command,
  jsonOptionsHelp: JsonOptionHelp[],
): void {
  jsonOptionsHelpByCommand.set(command, jsonOptionsHelp);
}

export function setAdditionalNotes(
  command: Command,
  additionalNotes: string,
): void {
  additionalNotesByCommand.set(command, additionalNotes);
}

export function useMarkdownHelp(command: Command): Command {
  command.configureHelp({
    formatHelp: formatMarkdownHelp,
  });
  return command;
}

function formatMarkdownHelp(command: Command): string {
  const lines: string[] = [];
  const visibleOptions = command.options.filter((option) => !option.hidden);
  const usage =
    visibleOptions.length > 0
      ? command.usage()
      : command
          .usage()
          .replace(/^\[options\]\s*/, "")
          .replace(/\s+\[options\]/, "");
  const syntax = `${getCommandPath(command)} ${usage}`.trim();
  lines.push(`# ${command.name()}`, "");
  lines.push("## Syntax", "", "```sh", syntax, "```", "");

  const description = command.description();
  if (description) {
    lines.push("## Description", "", description, "");
  }

  const argumentsHelp = command.registeredArguments.map((argument) => {
    const required = argument.required ? "required" : "optional";
    return `- \`${argument.name()}\` (${required}): ${argument.description}`;
  });
  if (argumentsHelp.length > 0) {
    lines.push("## Arguments", "", ...argumentsHelp, "");
  }

  const optionsHelp = visibleOptions.map((option) => {
    const required = option.mandatory ? "required" : "optional";
    return `- \`${option.flags}\` (${required}): ${option.description}`;
  });
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

  const subcommands = command.commands.map(
    (subcommand) => `- \`${subcommand.name()}\`: ${subcommand.description()}`,
  );
  if (subcommands.length > 0) {
    lines.push("## Commands", "", ...subcommands, "");
  }

  const additionalNotes = additionalNotesByCommand.get(command);
  if (additionalNotes) {
    lines.push(
      "## Additional Notes",
      "",
      additionalNotes.trim().replace(/^## /gm, "### "),
      "",
    );
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
