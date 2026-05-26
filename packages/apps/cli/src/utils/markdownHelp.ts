import { Command } from "commander";
import type * as v from "valibot";
import { getJsonSchemaHelp } from "./jsonSchemaHelp.js";

interface MarkdownHelpOptions {
  argsSchema?: v.GenericSchema<unknown, unknown>;
  additionalNotes?: string;
}

export function useMarkdownHelp(
  command: Command,
  options: MarkdownHelpOptions = {},
): Command {
  command.configureHelp({
    formatHelp: () => formatMarkdownHelp(command, options),
  });
  return command;
}

function formatMarkdownHelp(
  command: Command,
  options: MarkdownHelpOptions,
): string {
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

  if (options.argsSchema) {
    lines.push(
      "## Args File Schema",
      "",
      "```json",
      JSON.stringify(getJsonSchemaHelp(options.argsSchema), null, 2),
      "```",
      "",
    );
  }

  const subcommands = command.commands.map(
    (subcommand) => `- \`${subcommand.name()}\`: ${subcommand.description()}`,
  );
  if (subcommands.length > 0) {
    lines.push("## Commands", "", ...subcommands, "");
  }

  if (options.additionalNotes) {
    lines.push("## Additional Notes", "", options.additionalNotes.trim(), "");
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
